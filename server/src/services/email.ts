import type { LeadRecord } from "@love-at-home/shared";

export interface EmailService { sendLeadNotification(lead: LeadRecord): Promise<void> }

export class LeadNotificationUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LeadNotificationUnavailableError";
  }
}

export const emailService: EmailService = {
  async sendLeadNotification(lead) {
    if (!process.env.LEAD_NOTIFICATION_EMAIL || !process.env.EMAIL_FROM || !process.env.EMAIL_PROVIDER_API_KEY) {
      throw new LeadNotificationUnavailableError("Email notifications are not configured.");
    }
    // TODO: Connect the approved email provider using the structured message below.
    throw new LeadNotificationUnavailableError(`Email notification is not implemented for ${lead.leadId}.`);
  },
};

export function buildLeadNotification(lead: LeadRecord) {
  return {
    to: process.env.LEAD_NOTIFICATION_EMAIL,
    from: process.env.EMAIL_FROM,
    subject: `New website enquiry — ${lead.leadId}`,
    text: [
      `Lead ID: ${lead.leadId}`, `Submitted time: ${lead.dateReceived}`, `Name: ${lead.name}`, `Phone: ${lead.phone}`, `Email: ${lead.email || "Not provided"}`, `Suburb: ${lead.suburbPostcode}`, `Services requested: ${lead.serviceInterests.join(", ")}`, `Funding type: ${lead.fundingType}`, `Preferred language: ${lead.preferredLanguage}`, `Who enquiry is for: ${lead.enquiryFor}`, `Preferred contact method: ${lead.preferredContactMethod}`, `Best contact time: ${lead.bestTimeToContact}`, `Questions: ${lead.questions || "None provided"}`,
    ].join("\n"),
  };
}
