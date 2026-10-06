import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Props = { children: ReactNode; variant?: "primary" | "secondary" | "text" } & (
  | ({ href: string } & AnchorHTMLAttributes<HTMLAnchorElement>)
  | ({ href?: never } & ButtonHTMLAttributes<HTMLButtonElement>)
);

export function Button({ children, variant = "primary", ...props }: Props) {
  const className = `button button--${variant}`;
  if ("href" in props && props.href) return <a {...props} className={className}>{children}</a>;
  return <button {...(props as ButtonHTMLAttributes<HTMLButtonElement>)} className={className}>{children}</button>;
}

