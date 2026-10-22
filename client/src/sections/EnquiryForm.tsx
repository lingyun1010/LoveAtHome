import { useEffect, useRef, useState, type FormEvent } from "react";
import { normalizeAustralianPhone, serviceOptions, type EnquiryInput } from "@love-at-home/shared";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";
import { SectionHeading } from "../components/SectionHeading";
import type { Copy } from "../i18n";

type FormState = EnquiryInput;
const initial: FormState = { name: "", phone: "", email: "", suburbPostcode: "", enquiryFor: "", fundingType: "", preferredLanguage: "", preferredContactMethod: "", bestTimeToContact: "", serviceInterests: [], questions: "" };

export function EnquiryForm({ t }: { t: Copy["enquiry"] }) {
  const isPagesPreview = import.meta.env.MODE === "pages";
  const [form, setForm] = useState(initial);
  // Errors hold dictionary keys so messages follow the selected language.
  const [errors, setErrors] = useState<Record<string, keyof Copy["enquiry"]["errors"]>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error" | "conflict">("idle");
  const submissionId = useRef<string | null>(null);
  const multiSelectRef = useRef<HTMLDetailsElement>(null);
  const moreDetailsRef = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const onOutside = (event: PointerEvent) => {
      const details = multiSelectRef.current;
      if (details && event.target instanceof Node && !details.contains(event.target)) details.open = false;
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && multiSelectRef.current?.open) {
        multiSelectRef.current.open = false;
        multiSelectRef.current.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", onOutside);
    document.addEventListener("keydown", onEscape);
    return () => { document.removeEventListener("pointerdown", onOutside); document.removeEventListener("keydown", onEscape); };
  }, []);
  // Option values stay in English so submissions are consistent; only the visible label is translated.
  const options = (labels: Record<string, string>) => <><option value="">{t.selectOption}</option>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</>;
  const set = (name: keyof FormState, value: string) => setForm((current) => ({ ...current, [name]: value }));

  function toggleService(value: string) {
    setForm((current) => ({ ...current, serviceInterests: current.serviceInterests.includes(value) ? current.serviceInterests.filter((item) => item !== value) : [...current.serviceInterests, value] }));
  }

  function validate() {
    const next: Record<string, keyof Copy["enquiry"]["errors"]> = {};
    if (!form.name.trim()) next.name = "name";
    if (!form.phone.trim()) next.phone = "phone";
    else if (!normalizeAustralianPhone(form.phone)) next.phone = "phoneInvalid";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) next.email = "email";
    if (!form.suburbPostcode.trim()) next.suburbPostcode = "suburbPostcode";
    if (!form.serviceInterests.length) next.serviceInterests = "serviceInterests";
    setErrors(next);
    if (next.email && moreDetailsRef.current) moreDetailsRef.current.open = true;
    return Object.keys(next).length === 0;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (status === "sending") return;
    if (!validate()) { setStatus("error"); return; }
    if (isPagesPreview) {
      setErrors({});
      setStatus("success");
      return;
    }
    submissionId.current ??= crypto.randomUUID();
    setStatus("sending");
    try {
      const response = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": submissionId.current }, body: JSON.stringify({ ...form, phone: normalizeAustralianPhone(form.phone) }) });
      if (response.status === 409) {
        submissionId.current = null;
        setStatus("conflict");
        return;
      }
      if (!response.ok) throw new Error("Submission failed");
      submissionId.current = null;
      setForm(initial); setErrors({}); setStatus("success");
    } catch { setStatus("error"); }
  }

  return <section className="section enquiry-section" id="contact">
    <div className="container enquiry-layout">
      <div><SectionHeading eyebrow={t.eyebrow} title={t.title} intro={t.intro} />
        <div className="contact-note"><strong>{t.preferTalk}</strong><p>{t.call} <a href="tel:+61422559527">0422 559 527</a><br />{t.email} <a href="mailto:info@loveathome.com.au">info@loveathome.com.au</a></p></div>
      </div>
      <form className="enquiry-form" onSubmit={submit} noValidate>
        <div className="form-grid enquiry-essential">
          <FormField label={t.fields.name} name="name" value={form.name} onChange={(e) => set("name", e.target.value)} required error={errors.name && t.errors[errors.name]} autoComplete="name" />
          <FormField label={t.fields.phone} name="phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} required error={errors.phone && t.errors[errors.phone]} autoComplete="tel" />
          <FormField label={t.fields.email} name="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} error={errors.email && t.errors[errors.email]} autoComplete="email" />
          <FormField label={t.fields.suburbPostcode} name="suburbPostcode" value={form.suburbPostcode} onChange={(e) => set("suburbPostcode", e.target.value)} required error={errors.suburbPostcode && t.errors[errors.suburbPostcode]} autoComplete="postal-code" />
        </div>
        <div className="support-options">
          <label id="support-options-label">{t.supportLabel} <span aria-hidden="true">*</span></label>
          <details className="multi-select" ref={multiSelectRef}>
            <summary aria-labelledby="support-options-label support-options-value" aria-describedby={errors.serviceInterests ? "support-options-error" : undefined}>
              <span id="support-options-value">
                {form.serviceInterests.length === 0
                  ? t.supportPlaceholder
                  : t.supportSelected(form.serviceInterests.length)}
              </span>
              <span className="multi-select__chevron" aria-hidden="true">⌄</span>
            </summary>
            <fieldset className="multi-select__panel">
              <legend className="sr-only">{t.supportLegend}</legend>
              <p>{t.supportHint}</p>
              <div className="checkbox-grid">{serviceOptions.map((service) => <label key={service}><input type="checkbox" checked={form.serviceInterests.includes(service)} onChange={() => toggleService(service)} /><span>{t.serviceOptions[service]}</span></label>)}</div>
            </fieldset>
          </details>
          {errors.serviceInterests && <span className="field-error" id="support-options-error" role="alert">{t.errors[errors.serviceInterests]}</span>}
        </div>
        <details className="enquiry-more" ref={moreDetailsRef}>
          <summary>{t.moreDetails} <span aria-hidden="true">⌄</span></summary>
          <div className="form-grid enquiry-more-fields">
            <FormField kind="select" label={t.enquiryFor.label} name="enquiryFor" value={form.enquiryFor} onChange={(e) => set("enquiryFor", e.target.value)}>{options(t.enquiryFor.options)}</FormField>
            <FormField kind="select" label={t.fundingType.label} name="fundingType" value={form.fundingType} onChange={(e) => set("fundingType", e.target.value)}>{options(t.fundingType.options)}</FormField>
            <FormField label={t.preferredLanguage.label} name="preferredLanguage" value={form.preferredLanguage} onChange={(e) => set("preferredLanguage", e.target.value)} placeholder={t.preferredLanguage.placeholder} />
            <FormField kind="select" label={t.preferredContactMethod.label} name="preferredContactMethod" value={form.preferredContactMethod} onChange={(e) => set("preferredContactMethod", e.target.value)}>{options(t.preferredContactMethod.options)}</FormField>
            <FormField label={t.bestTimeToContact.label} name="bestTimeToContact" value={form.bestTimeToContact} onChange={(e) => set("bestTimeToContact", e.target.value)} placeholder={t.bestTimeToContact.placeholder} />
          </div>
        </details>
        <FormField kind="textarea" label={t.questions.label} name="questions" value={form.questions} onChange={(e) => set("questions", e.target.value)} rows={5} placeholder={t.questions.placeholder} hint={t.questions.hint} />
        {status === "success" && <div className="form-status form-status--success" role="status">{isPagesPreview ? <><strong>{t.previewTitle}</strong><span>{t.previewText}</span></> : <><strong>{t.successTitle}</strong><span>{t.successText}</span></>}</div>}
        {status === "conflict" && <div className="form-status form-status--error" role="alert"><strong>{t.conflictTitle}</strong><span>{t.conflictText}</span></div>}
        {status === "error" && <div className="form-status form-status--error" role="alert"><strong>{t.errorTitle}</strong><span>{t.errorText}</span></div>}
        <Button type="submit" disabled={status === "sending"}>{status === "sending" ? t.sending : t.submit}</Button>
      </form>
    </div>
  </section>;
}
