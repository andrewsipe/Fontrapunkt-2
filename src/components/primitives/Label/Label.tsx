/**
 * Label - Primitive for label text with consistent typography.
 * Renders as label, span, or heading; no layout. Use data-label for :has([data-label]) targeting.
 */

import type { HTMLAttributes, LabelHTMLAttributes } from "react";
import styles from "./Label.module.css";

export type LabelAs = "label" | "span" | "h2" | "h3" | "h4";

export type LabelVariant = "default" | "small" | "section" | "form" | "keyValue";

type BaseProps = {
  /** Element to render. Use "label" when associating with a control (pass htmlFor). */
  as?: LabelAs;
  /** Typography variant. */
  variant?: LabelVariant;
  /** Optional class name, merged with variant. */
  className?: string;
  /** When true, applies disabled styling (data-disabled). */
  disabled?: boolean;
  children: React.ReactNode;
};

type LabelProps = BaseProps &
  Omit<LabelHTMLAttributes<HTMLLabelElement>, keyof BaseProps> & {
    as?: "label";
    htmlFor?: string;
  };

type SpanOrHeadingProps = BaseProps &
  Omit<HTMLAttributes<HTMLSpanElement | HTMLHeadingElement>, keyof BaseProps> & {
    as: "span" | "h2" | "h3" | "h4";
    htmlFor?: string;
  };

export type LabelComponentProps = LabelProps | SpanOrHeadingProps;

const VARIANT_CLASS: Record<LabelVariant, string> = {
  default: styles.default,
  small: styles.small,
  section: styles.section,
  form: styles.form,
  keyValue: styles.keyValue,
};

export function Label({
  as: Component = "span",
  variant = "default",
  className = "",
  disabled = false,
  children,
  htmlFor,
  ...rest
}: LabelComponentProps) {
  const variantClass = VARIANT_CLASS[variant];
  const classNames = [styles.root, variantClass, className].filter(Boolean).join(" ");

  const common = {
    className: classNames,
    "data-label": true,
    ...(disabled && { "data-disabled": true }),
    ...rest,
  };

  if (Component === "label") {
    return (
      <label htmlFor={htmlFor} {...(common as LabelHTMLAttributes<HTMLLabelElement>)}>
        {children}
      </label>
    );
  }

  return <Component {...(common as HTMLAttributes<HTMLElement>)}>{children}</Component>;
}
