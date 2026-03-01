/**
 * Button – wraps Base UI Button for consistent behavior and future styling.
 * Use instead of native <button> so all buttons get data-disabled, focusableWhenDisabled, and one place to apply design-system styles.
 * @see https://base-ui.com/react/components/button
 */

import { Button as BaseButton } from "@base-ui/react/button";
import type React from "react";
import { forwardRef } from "react";

export type ButtonProps = React.ComponentProps<typeof BaseButton>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { type = "button", ...props },
  ref
) {
  return <BaseButton ref={ref} type={type} {...props} />;
});
Button.displayName = "Button";
