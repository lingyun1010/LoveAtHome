import { google } from "googleapis";
import type { LeadRecord } from "@love-at-home/shared";

export interface PersistLeadResult { lead: LeadRecord; duplicate: boolean }
export interface GoogleSheetsService { persistLead(lead: LeadRecord): Promise<PersistLeadResult> }

export class LeadPersistenceUnavailableError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "LeadPersistenceUnavailableError";
  }
}

type GoogleSheetsStage = "environment validation" | "authentication" | "spreadsheet lookup" | "worksheet/range lookup" | "row append";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function logStageFailure(stage: GoogleSheetsStage, error: unknown) {
  console.error("Google Sheets operation failed", {
    stage,
    message: errorMessage(error),
    name: error instanceof Error ? error.name : undefined,
  });
}

async function runGoogleSheetsStage<T>(stage: GoogleSheetsStage, operation: () => Promise<T>): Promise<T> {
  console.info("Google Sheets operation started", { stage });
  try {
    const result = await operation();
    console.info("Google Sheets operation completed", { stage });
    return result;
  } catch (error) {
    logStageFailure(stage, error);
    throw new LeadPersistenceUnavailableError(`Google Sheets ${stage} failed.`, { cause: error });
  }
}

export class IdempotencyConflictError extends Error {
  constructor() {
    super("The Idempotency-Key has already been used with different enquiry content.");
    this.name = "IdempotencyConflictError";
  }
}

function requireGoogleConfig() {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const configuredPrivateKey = process.env.GOOGLE_PRIVATE_KEY;
  const privateKey = configuredPrivateKey?.replace(/\\n/g, "\n");
  const sheetName = process.env.GOOGLE_SHEET_NAME || "Leads";
  const missing: string[] = [];
  if (!spreadsheetId) missing.push("GOOGLE_SHEET_ID");
  if (!clientEmail) missing.push("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  if (!privateKey) missing.push("GOOGLE_PRIVATE_KEY");
  console.info("Google Sheets environment validation", {
    configured: missing.length === 0,
    missing,
    privateKeyHasEscapedNewlines: configuredPrivateKey?.includes("\\n") ?? false,
    privateKeyHasActualNewlines: privateKey?.includes("\n") ?? false,
  });
  if (missing.length) {
    const error = new Error(`Missing required environment variables: ${missing.join(", ")}.`);
    logStageFailure("environment validation", error);
    throw new LeadPersistenceUnavailableError("Google Sheets is not configured.", { cause: error });
  }
  return { spreadsheetId: spreadsheetId!, clientEmail: clientEmail!, privateKey: privateKey!, sheetName };
}

const submissionLocks = new Map<string, Promise<void>>();

async function withSubmissionLock<T>(submissionId: string, work: () => Promise<T>): Promise<T> {
  const previous = submissionLocks.get(submissionId) ?? Promise.resolve();
  let release: () => void = () => {};
  const current = new Promise<void>((resolve) => { release = resolve; });
  submissionLocks.set(submissionId, current);
  await previous;
  try {
    return await work();
  } finally {
    release();
    if (submissionLocks.get(submissionId) === current) submissionLocks.delete(submissionId);
  }
}

export const googleSheetsService: GoogleSheetsService = {
  async persistLead(lead) {
    return withSubmissionLock(lead.submissionId, async () => {
      const config = requireGoogleConfig();
      try {
        const auth = new google.auth.JWT({ email: config.clientEmail, key: config.privateKey, scopes: ["https://www.googleapis.com/auth/spreadsheets"] });
        await runGoogleSheetsStage("authentication", () => auth.authorize());
        const sheets = google.sheets({ version: "v4", auth });
        const spreadsheet = await runGoogleSheetsStage("spreadsheet lookup", () => sheets.spreadsheets.get({
          spreadsheetId: config.spreadsheetId,
          fields: "spreadsheetId,sheets.properties.title",
        }));
        const worksheetExists = spreadsheet.data.sheets?.some(({ properties }) => properties?.title === config.sheetName);
        if (!worksheetExists) {
          const error = new Error(`Worksheet "${config.sheetName}" was not found.`);
          logStageFailure("worksheet/range lookup", error);
          throw new LeadPersistenceUnavailableError("Google Sheets worksheet/range lookup failed.", { cause: error });
        }
        const range = `'${config.sheetName.replace(/'/g, "''")}'!A:T`;
        const existingRows = await runGoogleSheetsStage("worksheet/range lookup", () => sheets.spreadsheets.values.get({ spreadsheetId: config.spreadsheetId, range }));
        const existingRow = existingRows.data.values?.find((row) => row[19] === lead.submissionId && row[0] && row[1]);
        if (existingRow) {
          const existingLead = fromGoogleSheetRow(existingRow);
          if (!hasSameEnquiryContent(existingLead, lead)) throw new IdempotencyConflictError();
          return { lead: existingLead, duplicate: true };
        }

        await runGoogleSheetsStage("row append", () => sheets.spreadsheets.values.append({
          spreadsheetId: config.spreadsheetId,
          range,
          valueInputOption: "RAW",
          insertDataOption: "INSERT_ROWS",
          requestBody: { values: [toGoogleSheetRow(lead)] },
        }));
        return { lead, duplicate: false };
      } catch (error) {
        if (error instanceof IdempotencyConflictError || error instanceof LeadPersistenceUnavailableError) throw error;
        console.error("Google Sheets persistence failed outside a tracked operation", { message: errorMessage(error), name: error instanceof Error ? error.name : undefined });
        throw toLeadPersistenceError(error);
      }
    });
  },
};

export function toLeadPersistenceError(error: unknown): LeadPersistenceUnavailableError {
  return new LeadPersistenceUnavailableError("Google Sheets persistence failed.", { cause: error });
}

export function underlyingPersistenceErrorMessage(error: unknown): string {
  if (error instanceof LeadPersistenceUnavailableError && error.cause !== undefined) return errorMessage(error.cause);
  return errorMessage(error);
}

export function toGoogleSheetRow(lead: LeadRecord): string[] {
  return [lead.leadId, lead.dateReceived, lead.name, lead.phone, lead.email || "", lead.suburbPostcode, lead.serviceInterests.join(", "), lead.fundingType, lead.preferredLanguage, lead.enquiryFor, lead.preferredContactMethod, lead.bestTimeToContact, lead.questions, lead.leadSource, lead.assignedOwner, lead.status, lead.nextFollowUpDate, lead.notes, lead.outcome, lead.submissionId];
}

export function hasSameEnquiryContent(existing: LeadRecord, candidate: LeadRecord): boolean {
  const materialContent = (lead: LeadRecord) => ({
    name: lead.name,
    phone: lead.phone,
    email: lead.email || "",
    suburbPostcode: lead.suburbPostcode,
    serviceInterests: [...lead.serviceInterests].sort(),
    fundingType: lead.fundingType,
    preferredLanguage: lead.preferredLanguage,
    enquiryFor: lead.enquiryFor,
    preferredContactMethod: lead.preferredContactMethod,
    bestTimeToContact: lead.bestTimeToContact,
    questions: lead.questions,
  });
  return JSON.stringify(materialContent(existing)) === JSON.stringify(materialContent(candidate));
}

function fromGoogleSheetRow(row: unknown[]): LeadRecord {
  const value = (index: number) => String(row[index] ?? "");
  return {
    leadId: value(0), dateReceived: value(1), name: value(2), phone: value(3), email: value(4), suburbPostcode: value(5),
    serviceInterests: value(6) ? value(6).split(", ") : [], fundingType: value(7), preferredLanguage: value(8), enquiryFor: value(9),
    preferredContactMethod: value(10), bestTimeToContact: value(11), questions: value(12), leadSource: "Website", assignedOwner: "Unassigned",
    status: "New", nextFollowUpDate: value(16), notes: value(17), outcome: value(18), submissionId: value(19),
  };
}
