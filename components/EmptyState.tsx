import { type ReactNode } from "react";

import { Icon, type IconName } from "@/components/Icon";

type EmptyStateProps = {
  /** Main message (the page's existing empty/error text). */
  title: ReactNode;
  description?: ReactNode;
  icon?: IconName;
  /** Optional action, e.g. a retry button. Rendered as-is. */
  action?: ReactNode;
  /** "neutral" for empty lists, "error" for failed loads. */
  tone?: "neutral" | "error";
  /** "panel" (default) is a dashed box for page-level lists; "compact" is borderless, for use inside cards. */
  size?: "panel" | "compact";
  /** Element for the title, to keep a heading where the page had one. Defaults to "p". */
  titleAs?: "p" | "h2" | "h3";
  className?: string;
};

const TONE_ICON_CLASS = {
  neutral: "bg-brand-secondary/10 text-brand-secondary",
  error: "bg-red-50 text-red-600",
};

const SIZE_CLASS = {
  panel: "gap-3 rounded-2xl border border-dashed border-brand-border bg-white/60 px-6 py-12",
  compact: "gap-2 py-6",
};

export function EmptyState({
  title,
  description,
  icon,
  action,
  tone = "neutral",
  size = "panel",
  titleAs: Title = "p",
  className = "",
}: EmptyStateProps) {
  const iconName = icon ?? (tone === "error" ? "error" : "search");
  const compact = size === "compact";

  return (
    <div className={["flex flex-col items-center text-center", SIZE_CLASS[size], className].filter(Boolean).join(" ")}>
      <span
        aria-hidden="true"
        className={`flex items-center justify-center rounded-full ${compact ? "h-10 w-10" : "h-14 w-14"} ${TONE_ICON_CLASS[tone]}`}
      >
        <Icon name={iconName} size={compact ? 20 : 28} />
      </span>
      <Title className={`font-display font-semibold text-brand-primary ${compact ? "text-sm" : "text-base"}`}>{title}</Title>
      {description ? <p className="max-w-md text-sm text-brand-primary/70">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
