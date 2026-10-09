import { AccountApi, Configuration, SendApi, type V1SendRequest } from "@hostinger/mail-sdk";
import type { LeadRecord } from "@love-at-home/shared";

export interface EmailService { sendLeadNotification(lead: LeadRecord): Promise<void> }

export class LeadNotificationUnavailableError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "LeadNotificationUnavailableError";
  }
}

function requireMailConfig() {
  const mailbox = process.env.HOSTINGER_MAILBOX;
  const apiKey = process.env.HOSTINGER_MAIL_API_KEY;
  const notificationEmail = process.env.LEAD_NOTIFICATION_EMAIL;
  if (!mailbox || !apiKey || !notificationEmail) throw new LeadNotificationUnavailableError("Hostinger Mail API is not configured.");
  return { mailbox, apiKey, notificationEmail };
}

export const emailService: EmailService = {
  async sendLeadNotification(lead) {
    const config = requireMailConfig();
    try {
      const sdkConfig = new Configuration({ accessToken: config.apiKey });
      const account = await new AccountApi(sdkConfig).getCurrentAccount();
      const mailbox = account.data.data.mailboxes.find(({ address }) => address.toLowerCase() === config.mailbox.toLowerCase());
      if (!mailbox) throw new Error("Configured mailbox is not available to this API token.");
      await new SendApi(sdkConfig).sendEmail(mailbox.resourceId, buildLeadNotification(lead, config.notificationEmail));
    } catch (error) {
      throw new LeadNotificationUnavailableError("Hostinger Mail API delivery failed.", { cause: error });
    }
  },
};

export function buildLeadNotification(lead: LeadRecord, to = process.env.LEAD_NOTIFICATION_EMAIL): V1SendRequest {
  const recipients = Array.from(new Set([to, "info@loveathome.com.au"].filter((address): address is string => Boolean(address))));

  return {
    to: recipients,
    displayName: "Love At Home",
    subject: `New website enquiry — ${lead.leadId} — ${lead.name}`,
    text: [
      `Lead ID: ${lead.leadId}`, `Date received: ${lead.dateReceived}`, `Name: ${lead.name}`, `Phone: ${lead.phone}`,
      `Email: ${lead.email || "Not provided"}`, `Suburb / postcode: ${lead.suburbPostcode}`, `Support requested: ${lead.serviceInterests.join(", ")}`,
      `Funding type: ${lead.fundingType || "Not provided"}`, `Preferred language: ${lead.preferredLanguage || "Not provided"}`,
      `Enquiry for: ${lead.enquiryFor || "Not provided"}`, `Preferred contact method: ${lead.preferredContactMethod || "Not provided"}`,
      `Best time to contact: ${lead.bestTimeToContact || "Not provided"}`, `Questions: ${lead.questions || "None provided"}`,
    ].join("\n"),
  } as V1SendRequest;
}
