import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

interface Base { label: string; name: string; required?: boolean; error?: string; hint?: ReactNode }
type Props = Base & (
  | ({ kind?: "input" } & InputHTMLAttributes<HTMLInputElement>)
  | ({ kind: "select"; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>)
  | ({ kind: "textarea" } & TextareaHTMLAttributes<HTMLTextAreaElement>)
);

export function FormField({ label, name, required, error, hint, ...props }: Props) {
  const id = `field-${name}`;
  const describedBy = [hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;
  return <div className={`form-field ${props.kind === "textarea" ? "form-field--wide" : ""}`}>
    <label htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label>
    {props.kind === "select" ? <select {...props} id={id} name={name} required={required} aria-invalid={!!error} aria-describedby={describedBy}>{props.children}</select>
      : props.kind === "textarea" ? <textarea {...props} id={id} name={name} required={required} aria-invalid={!!error} aria-describedby={describedBy} />
      : <input {...props} id={id} name={name} required={required} aria-invalid={!!error} aria-describedby={describedBy} />}
    {hint && <small id={`${id}-hint`}>{hint}</small>}
    {error && <span className="field-error" id={`${id}-error`} role="alert">{error}</span>}
  </div>;
}

