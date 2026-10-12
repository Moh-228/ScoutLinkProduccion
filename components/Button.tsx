import { type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "md" | "sm";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantMap: Record<ButtonVariant, string> = {
  primary: "bg-brand-primary text-white hover:bg-brand-primary/90",
  secondary: "bg-white text-brand-primary ring-1 ring-brand-border hover:bg-brand-background",
  ghost: "bg-transparent text-brand-primary hover:bg-brand-background",
  // Destructive confirm actions (outlined, so it never competes with the primary action).
  danger: "bg-white text-red-600 ring-1 ring-red-200 hover:bg-red-50",
};

// Padding/type size live here (not in the base string) so a smaller button never
// has to override `px-4 py-2 text-sm` through `className`, which would conflict.
const sizeMap: Record<ButtonSize, string> = {
  md: "px-4 py-2 text-sm",
  sm: "px-3 py-1 text-xs",
};

export function buttonClassNames(variant: ButtonVariant = "primary", className = "", size: ButtonSize = "md") {
  return [
    "inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction disabled:cursor-not-allowed disabled:opacity-60",
    sizeMap[size],
    variantMap[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function Button({ variant = "primary", size = "md", className = "", type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClassNames(variant, className, size)} {...props} />;
}
