import { randomUUID } from "node:crypto";
import { Router } from "express";
import type { LeadRecord } from "@love-at-home/shared";
import { emailService, LeadNotificationUnavailableError, type EmailService } from "../services/email.js";
import { googleSheetsService, IdempotencyConflictError, LeadPersistenceUnavailableError, underlyingPersistenceErrorMessage, type GoogleSheetsService } from "../services/googleSheets.js";
import { validateEnquiry } from "../validation/enquiry.js";

interface EnquiryDependencies { sheets: GoogleSheetsService; email: EmailService }

const idempotencyKeyPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function createEnquiriesRouter(dependencies: EnquiryDependencies = { sheets: googleSheetsService, email: emailService }) {
  const router = Router();
  router.post("/", async (req, res) => {
    const submissionId = req.get("Idempotency-Key");
    if (!submissionId || submissionId.length > 128 || !idempotencyKeyPattern.test(submissionId)) {
      res.status(400).json({ success: false, errors: { idempotencyKey: "A valid Idempotency-Key header is required." } });
      return;
    }
    const result = validateEnquiry(req.body);
    if (!result.valid || !result.data) {
      res.status(400).json({ success: false, errors: result.errors });
      return;
    }
    const now = new Date();
    const lead: LeadRecord = { ...result.data, leadId: `LAH-${now.getUTCFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`, submissionId, dateReceived: now.toISOString(), leadSource: "Website", assignedOwner: "Unassigned", status: "New", nextFollowUpDate: "", notes: "", outcome: "" };
    try {
      const persisted = await dependencies.sheets.persistLead(lead);
      // The row is the durable source of truth at this point. If notification fails,
      // retain it and return an error that directs the user to contact the team rather than silently reporting success.
      await dependencies.email.sendLeadNotification(persisted.lead);
      res.status(201).json({ success: true, leadId: persisted.lead.leadId, submittedAt: persisted.lead.dateReceived, duplicate: persisted.duplicate });
    } catch (error) {
      const category = error instanceof IdempotencyConflictError ? "idempotency_conflict" : error instanceof LeadPersistenceUnavailableError ? "google_sheets" : error instanceof LeadNotificationUnavailableError ? "hostinger_mail" : "unexpected";
      console.error("Enquiry processing failed", { leadId: lead.leadId, category });
      res.status(category === "idempotency_conflict" ? 409 : category === "unexpected" ? 500 : 503).json({
        success: false,
        message: category === "idempotency_conflict" ? "This submission has changed since it was first received. Please start a new enquiry." : category === "google_sheets" ? "We could not save your enquiry. Please contact Love At Home directly." : category === "hostinger_mail" ? "Your enquiry could not be fully processed. Please contact Love At Home directly." : "We could not process the enquiry. Please try again.",
        ...(process.env.NODE_ENV === "development" ? { debug: underlyingPersistenceErrorMessage(error) } : {}),
      });
    }
  });
  return router;
}

export const enquiriesRouter = createEnquiriesRouter();
