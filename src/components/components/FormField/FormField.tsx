/**
 * FormField - Wrapper with label row (LabelRow + Label primitive variant form), hint, and error.
 * Uses LabelRow with htmlFor for form mode; Label primitive is the single source for label typography.
 */

import React from "react";
import { LabelRow } from "../LabelRow";
import styles from "./FormField.module.css";

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactElement;
}

export const FormField: React.FC<FormFieldProps> = ({ label, error, hint, required, children }) => {
  const fieldId = React.useId();
  const errorId = error ? `${fieldId}-error` : undefined;
  const hintId = hint ? `${fieldId}-hint` : undefined;

  return (
    <div className={styles.formField}>
      <LabelRow
        label={label}
        htmlFor={fieldId}
        labelVariant="form"
        right={
          required ? (
            <span className={styles.required} aria-hidden>
              *
            </span>
          ) : undefined
        }
      />

      {hint && !error && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}

      {React.cloneElement(children, {
        id: fieldId,
        "aria-invalid": !!error,
        "aria-describedby": error ? errorId : hintId,
      } as React.HTMLAttributes<HTMLElement>)}

      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
