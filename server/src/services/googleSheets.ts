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

function requireGoogleConfig() {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const sheetName = process.env.GOOGLE_SHEET_NAME || "Leads";
  if (!spreadsheetId || !clientEmail || !privateKey) throw new LeadPersistenceUnavailableError("Google Sheets is not configured.");
  return { spreadsheetId, clientEmail, privateKey, sheetName };
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
        const sheets = google.sheets({ version: "v4", auth });
        const range = `'${config.sheetName.replace(/'/g, "''")}'!A:T`;
        const existingRows = await sheets.spreadsheets.values.get({ spreadsheetId: config.spreadsheetId, range });
        const existingRow = existingRows.data.values?.find((row) => row[19] === lead.submissionId && row[0] && row[1]);
        if (existingRow) return { lead: fromGoogleSheetRow(existingRow), duplicate: true };

        await sheets.spreadsheets.values.append({
          spreadsheetId: config.spreadsheetId,
          range,
          valueInputOption: "USER_ENTERED",
          insertDataOption: "INSERT_ROWS",
          requestBody: { values: [toGoogleSheetRow(lead)] },
        });
        return { lead, duplicate: false };
      } catch (error) {
        console.error("Google Sheets persistence failed", {
          message: error instanceof Error ? error.message : String(error),
          name: error instanceof Error ? error.name : undefined,
        });
        throw toLeadPersistenceError(error);
      }
    });
  },
};

export function toLeadPersistenceError(error: unknown): LeadPersistenceUnavailableError {
  return new LeadPersistenceUnavailableError("Google Sheets persistence failed.", { cause: error });
}

export function toGoogleSheetRow(lead: LeadRecord): string[] {
  return [lead.leadId, lead.dateReceived, lead.name, lead.phone, lead.email || "", lead.suburbPostcode, lead.serviceInterests.join(", "), lead.fundingType, lead.preferredLanguage, lead.enquiryFor, lead.preferredContactMethod, lead.bestTimeToContact, lead.questions, lead.leadSource, lead.assignedOwner, lead.status, lead.nextFollowUpDate, lead.notes, lead.outcome, lead.submissionId];
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
