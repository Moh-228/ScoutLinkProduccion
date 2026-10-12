import { type HTMLAttributes } from "react";

import { Icon, type IconName } from "@/components/Icon";

export type AlertVariant = "error" | "success" | "warning" | "info";

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: AlertVariant;
  /** "inline" (default) is a rounded box inside content; "banner" is a full-width strip (e.g. under the top bar). */
  layout?: "inline" | "banner";
  /** Show the variant's icon. Defaults to true. */
  icon?: boolean;
};

// Same color families the app already used for each message type (red / emerald / amber),
// plus the brand-secondary tint used by the `info` Badge.
const VARIANT_CLASS: Record<AlertVariant, string> = {
  error: "border-red-200 bg-red-50 text-red-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  info: "border-brand-secondary/30 bg-brand-secondary/10 text-brand-primary",
};

const VARIANT_ICON: Record<AlertVariant, IconName> = {
  error: "error",
  success: "verified",
  warning: "hourglass",
  info: "notifications",
};

// Errors interrupt (role="alert"); success messages are polite (role="status"),
// matching how the app announced them before. Callers can still override `role`.
const VARIANT_ROLE: Partial<Record<AlertVariant, string>> = {
  error: "alert",
  success: "status",
};

const LAYOUT_CLASS = {
  inline: "rounded-lg border px-3 py-2",
  banner: "border-b px-4 py-3 sm:px-6",
};

export function Alert({ variant = "error", layout = "inline", icon = true, role, className = "", children, ...props }: AlertProps) {
  return (
    <div
      role={role ?? VARIANT_ROLE[variant]}
      className={["flex items-start gap-2 text-sm", LAYOUT_CLASS[layout], VARIANT_CLASS[variant], className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {icon ? <Icon name={VARIANT_ICON[variant]} size={18} className="mt-px shrink-0" /> : null}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
