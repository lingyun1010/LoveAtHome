import { normalizeAustralianPhone, serviceOptions, type EnquiryInput } from "@love-at-home/shared";

export interface ValidationResult { valid: boolean; errors: Record<string, string>; data?: EnquiryInput }

export function validateEnquiry(value: unknown): ValidationResult {
  if (!value || typeof value !== "object") return { valid: false, errors: { form: "Invalid enquiry payload." } };
  const input = value as Record<string, unknown>;
  const requiredStrings = ["name", "phone", "suburbPostcode"] as const;
  const errors: Record<string, string> = {};
  for (const field of requiredStrings) if (typeof input[field] !== "string" || !input[field].trim()) errors[field] = "This field is required.";
  const normalizedPhone = typeof input.phone === "string" ? normalizeAustralianPhone(input.phone) : null;
  if (typeof input.phone === "string" && input.phone.trim() && !normalizedPhone) errors.phone = "Please enter a valid Australian phone number.";
  if (input.email && (typeof input.email !== "string" || !/^\S+@\S+\.\S+$/.test(input.email))) errors.email = "A valid email address is required.";
  if (!Array.isArray(input.serviceInterests) || input.serviceInterests.length === 0) errors.serviceInterests = "Select at least one support option.";
  else if (input.serviceInterests.some((item) => typeof item !== "string" || !serviceOptions.includes(item as typeof serviceOptions[number]))) errors.serviceInterests = "One or more support options are invalid.";
  for (const [key, item] of Object.entries(input)) if (typeof item === "string" && item.length > 2000) errors[key] = "This field is too long.";
  if (Object.keys(errors).length) return { valid: false, errors };
  return { valid: true, errors: {}, data: {
    name: String(input.name).trim(), phone: normalizedPhone!, email: String(input.email || "").trim(), suburbPostcode: String(input.suburbPostcode).trim(), enquiryFor: String(input.enquiryFor || "").trim(), fundingType: String(input.fundingType || "").trim(), preferredLanguage: String(input.preferredLanguage || "").trim(), preferredContactMethod: String(input.preferredContactMethod || "").trim(), bestTimeToContact: String(input.bestTimeToContact || "").trim(), serviceInterests: input.serviceInterests as string[], questions: String(input.questions || "").trim(),
  } };
}
