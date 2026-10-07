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
