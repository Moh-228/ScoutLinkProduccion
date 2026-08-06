import { type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantMap: Record<ButtonVariant, string> = {
  primary: "bg-brand-primary text-white hover:bg-brand-primary/90",
  secondary: "bg-white text-brand-primary ring-1 ring-brand-border hover:bg-brand-background",
  ghost: "bg-transparent text-brand-primary hover:bg-brand-background",
};

export function buttonClassNames(variant: ButtonVariant = "primary", className = "") {
  return [
    "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction disabled:cursor-not-allowed disabled:opacity-60",
    variantMap[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function Button({ variant = "primary", className = "", type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClassNames(variant, className)} {...props} />;
}
