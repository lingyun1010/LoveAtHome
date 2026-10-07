import { randomUUID } from "node:crypto";
import { Router } from "express";
import type { LeadRecord } from "@love-at-home/shared";
import { emailService, LeadNotificationUnavailableError, type EmailService } from "../services/email.js";
import { googleSheetsService, LeadPersistenceUnavailableError, type GoogleSheetsService } from "../services/googleSheets.js";
import { validateEnquiry } from "../validation/enquiry.js";

interface EnquiryDependencies { sheets: GoogleSheetsService; email: EmailService }

export function createEnquiriesRouter(dependencies: EnquiryDependencies = { sheets: googleSheetsService, email: emailService }) {
  const router = Router();
  router.post("/", async (req, res) => {
    const result = validateEnquiry(req.body);
    if (!result.valid || !result.data) {
      res.status(400).json({ success: false, errors: result.errors });
      return;
    }
    const now = new Date();
    const lead: LeadRecord = { ...result.data, leadId: `LAH-${now.getUTCFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`, dateReceived: now.toISOString(), leadSource: "Website", assignedOwner: "Unassigned", status: "New", nextFollowUpDate: "", notes: "", outcome: "" };
    try {
      await dependencies.sheets.appendLead(lead);
      // The row is the durable source of truth at this point. If notification fails,
      // retain it and return an error that directs the user to contact the team rather than silently reporting success.
      await dependencies.email.sendLeadNotification(lead);
      res.status(201).json({ success: true, leadId: lead.leadId, submittedAt: lead.dateReceived });
    } catch (error) {
      const category = error instanceof LeadPersistenceUnavailableError ? "google_sheets" : error instanceof LeadNotificationUnavailableError ? "hostinger_mail" : "unexpected";
      console.error("Enquiry processing failed", { leadId: lead.leadId, category });
      res.status(category === "unexpected" ? 500 : 503).json({
        success: false,
        message: category === "google_sheets" ? "We could not save your enquiry. Please contact Love At Home directly." : category === "hostinger_mail" ? "Your enquiry could not be fully processed. Please contact Love At Home directly." : "We could not process the enquiry. Please try again.",
      });
    }
  });
  return router;
}

export const enquiriesRouter = createEnquiriesRouter();
