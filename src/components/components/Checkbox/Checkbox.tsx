/**
 * Checkbox - Styled native checkbox with label.
 * Use for on/off settings (distinct from toggle/switch: checkbox = multiple options, toggle = single setting).
 */

import type { InputHTMLAttributes } from "react";
import { useId } from "react";
import styles from "./Checkbox.module.css";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /** Checked state (controlled) */
  checked: boolean;
  /** Change handler */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Label content (rendered after the box) */
  children?: React.ReactNode;
  /** Optional class on the wrapper label */
  className?: string;
}

export function Checkbox({
  checked,
  onChange,
  disabled,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  children,
  className = "",
  ...rest
}: CheckboxProps) {
  const generatedId = useId();
  const labelClass = [styles.label, className].filter(Boolean).join(" ");
  const inputId = id ?? generatedId;

  return (
    <label htmlFor={inputId} className={labelClass}>
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-labelledby={children ? undefined : ariaLabelledby}
        className={styles.input}
        {...rest}
      />
      {children != null && <span>{children}</span>}
    </label>
  );
}
