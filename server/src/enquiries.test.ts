import assert from "node:assert/strict";
import test from "node:test";
import express from "express";
import request from "supertest";
import type { LeadRecord } from "@love-at-home/shared";
import { createEnquiriesRouter } from "./routes/enquiries.js";
import { LeadNotificationUnavailableError } from "./services/email.js";
import { LeadPersistenceUnavailableError, toGoogleSheetRow } from "./services/googleSheets.js";

const payload = {
  name: "Test Person",
  phone: "0400000000",
  email: "test@example.com",
  suburbPostcode: "Sydney 2000",
  enquiryFor: "Myself",
  fundingType: "Private",
  preferredLanguage: "English",
  preferredContactMethod: "Phone",
  bestTimeToContact: "Morning",
  serviceInterests: ["Personal Care", "Transport"],
  questions: "What is available?",
};

const lead: LeadRecord = {
  ...payload,
  leadId: "LAH-2026-ABC12345",
  dateReceived: "2026-10-07T00:00:00.000Z",
  leadSource: "Website",
  assignedOwner: "Unassigned",
  status: "New",
  nextFollowUpDate: "",
  notes: "",
  outcome: "",
};

function appWith(sheets: (lead: LeadRecord) => Promise<void>, email: (lead: LeadRecord) => Promise<void>) {
  const app = express();
  app.use(express.json());
  app.use("/api/enquiries", createEnquiriesRouter({ sheets: { appendLead: sheets }, email: { sendLeadNotification: email } }));
  return app;
}

test("maps a lead to the exact 19-column sheet order", () => {
  assert.deepEqual(toGoogleSheetRow(lead), [
    "LAH-2026-ABC12345", "2026-10-07T00:00:00.000Z", "Test Person", "0400000000", "test@example.com",
    "Sydney 2000", "Personal Care, Transport", "Private", "English", "Myself", "Phone", "Morning",
    "What is available?", "Website", "Unassigned", "New", "", "", "",
  ]);
});

test("fails and does not send email when Google Sheets fails", async () => {
  let emailCalled = false;
  const originalError = console.error;
  console.error = () => undefined;
  try {
    const response = await request(appWith(
      async () => { throw new LeadPersistenceUnavailableError("failed"); },
      async () => { emailCalled = true; },
    )).post("/api/enquiries").send(payload);
    assert.equal(response.status, 503);
    assert.equal(response.body.success, false);
    assert.equal(emailCalled, false);
  } finally { console.error = originalError; }
});

test("fails when email fails after a successful sheet append", async () => {
  const originalError = console.error;
  console.error = () => undefined;
  try {
    const response = await request(appWith(
      async () => undefined,
      async () => { throw new LeadNotificationUnavailableError("failed"); },
    )).post("/api/enquiries").send(payload);
    assert.equal(response.status, 503);
    assert.equal(response.body.success, false);
  } finally { console.error = originalError; }
});

test("returns 201 only after both integrations succeed", async () => {
  const calls: string[] = [];
  const response = await request(appWith(
    async () => { calls.push("sheet"); },
    async () => { calls.push("email"); },
  )).post("/api/enquiries").send(payload);
  assert.equal(response.status, 201);
  assert.equal(response.body.success, true);
  assert.match(response.body.leadId, /^LAH-\d{4}-[A-F0-9]{8}$/);
  assert.deepEqual(calls, ["sheet", "email"]);
});
