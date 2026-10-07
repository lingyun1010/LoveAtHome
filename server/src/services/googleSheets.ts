import { google } from "googleapis";
import type { LeadRecord } from "@love-at-home/shared";

export interface GoogleSheetsService { appendLead(lead: LeadRecord): Promise<void> }

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

export const googleSheetsService: GoogleSheetsService = {
  async appendLead(lead) {
    const config = requireGoogleConfig();
    try {
      const auth = new google.auth.JWT({ email: config.clientEmail, key: config.privateKey, scopes: ["https://www.googleapis.com/auth/spreadsheets"] });
      const sheets = google.sheets({ version: "v4", auth });
      await sheets.spreadsheets.values.append({
        spreadsheetId: config.spreadsheetId,
        range: `'${config.sheetName.replace(/'/g, "''")}'!A:S`,
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: [toGoogleSheetRow(lead)] },
      });
    } catch (error) {
      console.error("Google Sheets append failed", {
        message: error instanceof Error ? error.message : String(error),
        name: error instanceof Error ? error.name : undefined,
      });
      throw toLeadPersistenceError(error);
    }
  },
};

export function toLeadPersistenceError(error: unknown): LeadPersistenceUnavailableError {
  return new LeadPersistenceUnavailableError("Google Sheets append failed.", { cause: error });
}

export function toGoogleSheetRow(lead: LeadRecord): string[] {
  return [lead.leadId, lead.dateReceived, lead.name, lead.phone, lead.email || "", lead.suburbPostcode, lead.serviceInterests.join(", "), lead.fundingType, lead.preferredLanguage, lead.enquiryFor, lead.preferredContactMethod, lead.bestTimeToContact, lead.questions, lead.leadSource, lead.assignedOwner, lead.status, lead.nextFollowUpDate, lead.notes, lead.outcome];
}
