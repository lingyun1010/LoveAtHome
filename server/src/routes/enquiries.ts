import { randomUUID } from "node:crypto";
import { Router } from "express";
import type { LeadRecord } from "@love-at-home/shared";
import { emailService } from "../services/email.js";
import { googleSheetsService, toGoogleSheetRow } from "../services/googleSheets.js";
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
    await emailService.sendLeadNotification(lead);
    res.status(201).json({ success: true, leadId: lead.leadId, submittedAt: lead.dateReceived, sheetRowPrepared: sheetRow.length === 19 });
  } catch (error) {
    console.error("Enquiry processing failed", error);
    res.status(500).json({ success: false, message: "We could not process the enquiry. Please try again." });
  }
});

