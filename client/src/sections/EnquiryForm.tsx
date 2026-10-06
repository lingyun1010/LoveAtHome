import { useState, type FormEvent } from "react";
import { serviceOptions, type EnquiryInput } from "@love-at-home/shared";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";
import { SectionHeading } from "../components/SectionHeading";

type FormState = EnquiryInput;
const initial: FormState = { name: "", phone: "", email: "", suburbPostcode: "", enquiryFor: "", fundingType: "", preferredLanguage: "", preferredContactMethod: "", bestTimeToContact: "", serviceInterests: [], questions: "" };

export function EnquiryForm() {
  const isPagesPreview = import.meta.env.MODE === "pages";
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const set = (name: keyof FormState, value: string) => setForm((current) => ({ ...current, [name]: value }));

  function toggleService(value: string) {
    setForm((current) => ({ ...current, serviceInterests: current.serviceInterests.includes(value) ? current.serviceInterests.filter((item) => item !== value) : [...current.serviceInterests, value] }));
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Please enter your name.";
    if (!form.phone.trim()) next.phone = "Please enter a phone number.";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Please enter a valid email address.";
    if (!form.suburbPostcode.trim()) next.suburbPostcode = "Please enter a suburb or postcode.";
    if (!form.serviceInterests.length) next.serviceInterests = "Please select at least one support option.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) { setStatus("error"); return; }
    if (isPagesPreview) {
      setErrors({});
      setStatus("success");
      return;
    }
    setStatus("sending");
    try {
      const response = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!response.ok) throw new Error("Submission failed");
      setForm(initial); setErrors({}); setStatus("success");
    } catch { setStatus("error"); }
  }

  return <section className="section enquiry-section" id="contact">
    <div className="container enquiry-layout">
      <div><SectionHeading eyebrow="MAKE AN ENQUIRY" title="Tell us how we can help." intro="Share a few details and the Love At Home team can discuss the most suitable next step with you." />
        <div className="contact-note"><strong>Prefer to talk?</strong><p>Public phone number to be confirmed.</p></div>
      </div>
      <form className="enquiry-form" onSubmit={submit} noValidate>
        <div className="form-grid">
          <FormField label="Name" name="name" value={form.name} onChange={(e) => set("name", e.target.value)} required error={errors.name} autoComplete="name" />
          <FormField label="Phone" name="phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} required error={errors.phone} autoComplete="tel" />
          <FormField label="Email (optional)" name="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} error={errors.email} autoComplete="email" />
          <FormField label="Suburb / postcode" name="suburbPostcode" value={form.suburbPostcode} onChange={(e) => set("suburbPostcode", e.target.value)} required error={errors.suburbPostcode} autoComplete="postal-code" />
          <FormField kind="select" label="Who is the enquiry for? (optional)" name="enquiryFor" value={form.enquiryFor} onChange={(e) => set("enquiryFor", e.target.value)}><option value="">Select an option</option><option>Myself</option><option>A family member</option><option>Someone I care for</option><option>Other</option></FormField>
          <FormField kind="select" label="Funding type (if known)" name="fundingType" value={form.fundingType} onChange={(e) => set("fundingType", e.target.value)}><option value="">Select an option</option><option>Support at Home</option><option>Private funding</option><option>Other</option><option>Not sure</option></FormField>
          <FormField label="Preferred language (optional)" name="preferredLanguage" value={form.preferredLanguage} onChange={(e) => set("preferredLanguage", e.target.value)} placeholder="e.g. English, Mandarin" />
          <FormField kind="select" label="Preferred contact method (optional)" name="preferredContactMethod" value={form.preferredContactMethod} onChange={(e) => set("preferredContactMethod", e.target.value)}><option value="">Select an option</option><option>Phone call</option><option>Email</option><option>SMS</option></FormField>
          <FormField label="Best time to contact (optional)" name="bestTimeToContact" value={form.bestTimeToContact} onChange={(e) => set("bestTimeToContact", e.target.value)} placeholder="e.g. Weekday mornings" />
        </div>
        <div className="support-options">
          <label id="support-options-label">Type of Support Needed <span aria-hidden="true">*</span></label>
          <details className="multi-select">
            <summary aria-labelledby="support-options-label support-options-value" aria-describedby={errors.serviceInterests ? "support-options-error" : undefined}>
              <span id="support-options-value">
                {form.serviceInterests.length === 0
                  ? "Select support options"
                  : `${form.serviceInterests.length} option${form.serviceInterests.length === 1 ? "" : "s"} selected`}
              </span>
              <span className="multi-select__chevron" aria-hidden="true">⌄</span>
            </summary>
            <fieldset className="multi-select__panel">
              <legend className="sr-only">Select all types of support needed</legend>
              <p>Select all that apply.</p>
              <div className="checkbox-grid">{serviceOptions.map((service) => <label key={service}><input type="checkbox" checked={form.serviceInterests.includes(service)} onChange={() => toggleService(service)} /><span>{service}</span></label>)}</div>
            </fieldset>
          </details>
          {errors.serviceInterests && <span className="field-error" id="support-options-error" role="alert">{errors.serviceInterests}</span>}
        </div>
        <FormField kind="textarea" label="What questions do you have?" name="questions" value={form.questions} onChange={(e) => set("questions", e.target.value)} rows={5} placeholder="Tell us what you would like to ask or understand." hint="Please do not include detailed medical or sensitive personal information in this initial enquiry." />
        {status === "success" && <div className="form-status form-status--success" role="status">{isPagesPreview ? <><strong>Preview only — no enquiry was submitted.</strong><span>Thanks — this preview does not submit enquiries yet. The live website will connect this form to the Love At Home enquiry workflow.</span></> : <><strong>Thank you — your enquiry has been received.</strong><span>A team member will follow up using your preferred contact method.</span></>}</div>}
        {status === "error" && <div className="form-status form-status--error" role="alert"><strong>We couldn't submit the form yet.</strong><span>Please review the highlighted fields or try again.</span></div>}
        <Button type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Submit enquiry"}</Button>
      </form>
    </div>
  </section>;
}
