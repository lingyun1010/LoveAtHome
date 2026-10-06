import { randomUUID } from "node:crypto";
import { Router } from "express";
import type { LeadRecord } from "@love-at-home/shared";
import { emailService } from "../services/email.js";
import { googleSheetsService, LeadPersistenceUnavailableError, toGoogleSheetRow } from "../services/googleSheets.js";
import { validateEnquiry } from "../validation/enquiry.js";

export const enquiriesRouter = Router();

enquiriesRouter.post("/", async (req, res) => {
  const result = validateEnquiry(req.body);
  if (!result.valid || !result.data) { res.status(400).json({ success: false, errors: result.errors }); return; }
  const now = new Date();
  const lead: LeadRecord = { ...result.data, leadId: `LAH-${now.getUTCFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`, dateReceived: now.toISOString(), leadSource: "Website", assignedOwner: "Unassigned", status: "New", nextFollowUpDate: "", notes: "", outcome: "" };
  try {
    const sheetRow = toGoogleSheetRow(lead);
    await googleSheetsService.appendLead(lead);
    let notificationSent = true;
    try {
      await emailService.sendLeadNotification(lead);
    } catch (error) {
      notificationSent = false;
      console.error(`Lead ${lead.leadId} was persisted, but its notification email failed.`, error);
    }
    res.status(201).json({ success: true, leadId: lead.leadId, submittedAt: lead.dateReceived, sheetRowPrepared: sheetRow.length === 19, notificationSent });
  } catch (error) {
    console.error("Enquiry processing failed", error);
    const unavailable = error instanceof LeadPersistenceUnavailableError;
    res.status(unavailable ? 503 : 500).json({ success: false, message: unavailable ? "Enquiry submission is not available yet. Please contact Love At Home directly." : "We could not process the enquiry. Please try again." });
  }
});
