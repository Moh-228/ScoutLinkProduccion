import { type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantMap: Record<ButtonVariant, string> = {
  primary: "bg-[#1883ff] text-white hover:bg-[#75C3FF]",
  secondary: "bg-white text-black ring-1 ring-slate-300 hover:bg-slate-100",
  ghost: "bg-transparent text-black hover:bg-slate-100",
};

export function buttonClassNames(variant: ButtonVariant = "primary", className = "") {
  return [
    "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
    variantMap[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function Button({ variant = "primary", className = "", type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClassNames(variant, className)} {...props} />;
}
