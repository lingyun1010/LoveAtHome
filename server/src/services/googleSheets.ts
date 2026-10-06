import type { LeadRecord } from "@love-at-home/shared";

export interface GoogleSheetsService { appendLead(lead: LeadRecord): Promise<void> }

export class LeadPersistenceUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LeadPersistenceUnavailableError";
  }
}

export const googleSheetsService: GoogleSheetsService = {
  async appendLead(lead) {
    if (!process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      throw new LeadPersistenceUnavailableError("Google Sheets is not configured.");
    }
    // TODO: Add the approved Google Sheets API client and append the mapped lead row.
    throw new LeadPersistenceUnavailableError(`Google Sheets append is not implemented for ${lead.leadId}.`);
  },
};

export function toGoogleSheetRow(lead: LeadRecord) {
  return [lead.leadId, lead.dateReceived, lead.name, lead.phone, lead.email || "", lead.suburbPostcode, lead.serviceInterests.join(", "), lead.fundingType, lead.preferredLanguage, lead.enquiryFor, lead.preferredContactMethod, lead.bestTimeToContact, lead.questions, lead.leadSource, lead.assignedOwner, lead.status, lead.nextFollowUpDate, lead.notes, lead.outcome];
}
