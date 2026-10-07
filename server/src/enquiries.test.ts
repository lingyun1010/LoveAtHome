import assert from "node:assert/strict";
import test from "node:test";
import express from "express";
import request from "supertest";
import type { LeadRecord } from "@love-at-home/shared";
import { createEnquiriesRouter } from "./routes/enquiries.js";
import { LeadNotificationUnavailableError } from "./services/email.js";
import { hasSameEnquiryContent, IdempotencyConflictError, LeadPersistenceUnavailableError, type PersistLeadResult, toGoogleSheetRow, toLeadPersistenceError } from "./services/googleSheets.js";

const keyOne = "00000000-0000-4000-8000-000000000001";
const keyTwo = "00000000-0000-4000-8000-000000000002";
const payload = {
  name: "Test Person", phone: "0400000000", email: "test@example.com", suburbPostcode: "Sydney 2000",
  enquiryFor: "Myself", fundingType: "Private", preferredLanguage: "English", preferredContactMethod: "Phone",
  bestTimeToContact: "Morning", serviceInterests: ["Personal Care", "Transport"], questions: "What is available?",
};

const lead: LeadRecord = {
  ...payload, leadId: "LAH-2026-ABC12345", submissionId: keyOne, dateReceived: "2026-10-07T00:00:00.000Z",
  leadSource: "Website", assignedOwner: "Unassigned", status: "New", nextFollowUpDate: "", notes: "", outcome: "",
};

function appWith(persistLead: (lead: LeadRecord) => Promise<PersistLeadResult>, email: (lead: LeadRecord) => Promise<void>) {
  const app = express();
  app.use(express.json());
  app.use("/api/enquiries", createEnquiriesRouter({ sheets: { persistLead }, email: { sendLeadNotification: email } }));
  return app;
}

function inMemorySheets() {
  const rows = new Map<string, LeadRecord>();
  let appendCount = 0;
  return {
    rows,
    get appendCount() { return appendCount; },
    async persistLead(candidate: LeadRecord): Promise<PersistLeadResult> {
      const existing = rows.get(candidate.submissionId);
      if (existing) {
        if (!hasSameEnquiryContent(existing, candidate)) throw new IdempotencyConflictError();
        return { lead: existing, duplicate: true };
      }
      rows.set(candidate.submissionId, candidate);
      appendCount += 1;
      return { lead: candidate, duplicate: false };
    },
  };
}

function post(app: express.Express, key = keyOne, body = payload) {
  return request(app).post("/api/enquiries").set("Idempotency-Key", key).send(body);
}

test("maps a lead to the exact 20-column A:T sheet order", () => {
  assert.deepEqual(toGoogleSheetRow(lead), [
    "LAH-2026-ABC12345", "2026-10-07T00:00:00.000Z", "Test Person", "0400000000", "test@example.com",
    "Sydney 2000", "Personal Care, Transport", "Private", "English", "Myself", "Phone", "Morning",
    "What is available?", "Website", "Unassigned", "New", "", "", "", keyOne,
  ]);
});

test("wraps raw Google API failures as LeadPersistenceUnavailableError", () => {
  const apiError = new Error("permission denied");
  const wrapped = toLeadPersistenceError(apiError);
  assert.ok(wrapped instanceof LeadPersistenceUnavailableError);
  assert.equal(wrapped.message, "Google Sheets persistence failed.");
  assert.equal(wrapped.cause, apiError);
});

test("rejects a missing or invalid Idempotency-Key", async () => {
  const sheets = inMemorySheets();
  const app = appWith(sheets.persistLead.bind(sheets), async () => undefined);
  assert.equal((await request(app).post("/api/enquiries").send(payload)).status, 400);
  assert.equal((await request(app).post("/api/enquiries").set("Idempotency-Key", "not-a-uuid").send(payload)).status, 400);
  assert.equal(sheets.appendCount, 0);
});

test("first submission appends exactly one row and returns duplicate=false", async () => {
  const sheets = inMemorySheets();
  const response = await post(appWith(sheets.persistLead.bind(sheets), async () => undefined));
  assert.equal(response.status, 201);
  assert.equal(response.body.duplicate, false);
  assert.equal(sheets.appendCount, 1);
});

test("retry with the same key does not append and reuses the Lead ID", async () => {
  const sheets = inMemorySheets();
  const app = appWith(sheets.persistLead.bind(sheets), async () => undefined);
  const first = await post(app);
  const retry = await post(app);
  assert.equal(retry.status, 201);
  assert.equal(retry.body.duplicate, true);
  assert.equal(retry.body.leadId, first.body.leadId);
  assert.equal(retry.body.submittedAt, first.body.submittedAt);
  assert.equal(sheets.appendCount, 1);
});

test("same key with changed material content returns 409", async () => {
  const sheets = inMemorySheets();
  let emailCount = 0;
  const app = appWith(sheets.persistLead.bind(sheets), async () => { emailCount += 1; });
  assert.equal((await post(app)).status, 201);
  const originalError = console.error;
  console.error = () => undefined;
  try {
    const conflict = await post(app, keyOne, { ...payload, questions: "This answer has changed." });
    assert.equal(conflict.status, 409);
    assert.equal(conflict.body.success, false);
    assert.equal(sheets.appendCount, 1);
    assert.equal(emailCount, 1);
  } finally { console.error = originalError; }
});

test("Sheet success plus email failure retries email without another row", async () => {
  const sheets = inMemorySheets();
  const emailedLeadIds: string[] = [];
  let emailAttempts = 0;
  const app = appWith(sheets.persistLead.bind(sheets), async (savedLead) => {
    emailAttempts += 1;
    emailedLeadIds.push(savedLead.leadId);
    if (emailAttempts === 1) throw new LeadNotificationUnavailableError("failed");
  });
  const originalError = console.error;
  console.error = () => undefined;
  try {
    const first = await post(app);
    const retry = await post(app);
    assert.equal(first.status, 503);
    assert.equal(retry.status, 201);
    assert.equal(retry.body.duplicate, true);
    assert.equal(sheets.appendCount, 1);
    assert.equal(emailAttempts, 2);
    assert.equal(new Set(emailedLeadIds).size, 1);
    assert.equal(retry.body.leadId, emailedLeadIds[0]);
  } finally { console.error = originalError; }
});

test("different idempotency keys create different leads", async () => {
  const sheets = inMemorySheets();
  const app = appWith(sheets.persistLead.bind(sheets), async () => undefined);
  const first = await post(app, keyOne);
  const second = await post(app, keyTwo);
  assert.equal(first.status, 201);
  assert.equal(second.status, 201);
  assert.notEqual(second.body.leadId, first.body.leadId);
  assert.equal(sheets.appendCount, 2);
});

test("does not send email when Google Sheets fails", async () => {
  let emailCalled = false;
  const originalError = console.error;
  console.error = () => undefined;
  try {
    const response = await post(appWith(
      async () => { throw new LeadPersistenceUnavailableError("failed"); },
      async () => { emailCalled = true; },
    ));
    assert.equal(response.status, 503);
    assert.equal(emailCalled, false);
  } finally { console.error = originalError; }
});
