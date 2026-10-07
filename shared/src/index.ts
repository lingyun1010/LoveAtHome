export const serviceOptions = [
  "Clinical Support",
  "Personal Care",
  "Nursing",
  "Allied Health / OT / Physiotherapy",
  "Independence / Social Support",
  "Transport",
  "Everyday Living",
  "Cleaning",
  "Shopping",
  "Meal Preparation",
  "Assistive Technology",
  "Home Modifications",
  "Not sure / I would like advice",
] as const;

/**
 * Returns an Australian mobile or geographic landline number in E.164 format.
 * Formatting characters are accepted for people entering familiar display
 * formats, but other characters and malformed parentheses are rejected.
 */
export function normalizeAustralianPhone(value: string): string | null {
  const phone = value.trim();
  if (!phone || !/^[+\d\s()-]+$/.test(phone) || (phone.match(/\+/g) ?? []).length > 1 || (phone.includes("+") && !phone.startsWith("+"))) return null;

  let depth = 0;
  for (const character of phone) {
    if (character === "(") depth += 1;
    if (character === ")") depth -= 1;
    if (depth < 0 || depth > 1) return null;
  }
  if (depth !== 0) return null;

  const compact = phone.replace(/[\s()-]/g, "");
  const local = compact.startsWith("+61") ? `0${compact.slice(3)}` : compact;
  if (!/^0(?:4\d{8}|[2378]\d{8})$/.test(local)) return null;
  return `+61${local.slice(1)}`;
}

export function isValidAustralianPhone(value: string): boolean {
  return normalizeAustralianPhone(value) !== null;
}

export interface EnquiryInput {
  name: string;
  phone: string;
  email?: string;
  suburbPostcode: string;
  enquiryFor: string;
  fundingType: string;
  preferredLanguage: string;
  preferredContactMethod: string;
  bestTimeToContact: string;
  serviceInterests: string[];
  questions: string;
}

export interface LeadRecord extends EnquiryInput {
  leadId: string;
  submissionId: string;
  dateReceived: string;
  leadSource: "Website";
  assignedOwner: "Unassigned";
  status: "New";
  nextFollowUpDate: string;
  notes: string;
  outcome: string;
}
