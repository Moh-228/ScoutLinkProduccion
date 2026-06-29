import { type SelectHTMLAttributes } from "react";

export type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  label?: string;
  options: SelectOption[];
};

export function Select({ id, label, options, className = "", ...props }: SelectProps) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5 text-sm font-medium text-white">
      {label ? <span>{label}</span> : null}
      <select
        id={id}
        className={[
          "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition-colors focus:border-cyan-600",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
