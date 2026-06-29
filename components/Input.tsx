import { forwardRef, type InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  id: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, className = "", id, ...props },
  ref,
) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5 text-sm font-medium text-white">
      {label ? <span>{label}</span> : null}
      <input
        id={id}
        ref={ref}
        className={[
          "w-full rounded-lg border border-[#18181b] bg-white px-3 py-2 text-black shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-[#18181b]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
    </label>
  );
});
