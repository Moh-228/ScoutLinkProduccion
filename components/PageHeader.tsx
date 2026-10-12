import { type ReactNode } from "react";

type PageHeaderProps = {
  title: ReactNode;
  /** Optional content above the title (e.g. badges or a back link). */
  eyebrow?: ReactNode;
  description?: ReactNode;
  /** Page-level actions (buttons/links), rendered as-is to the right on wide screens. */
  actions?: ReactNode;
  className?: string;
};

/** Page title block for authenticated pages: `h1` in the display face, optional description and actions. */
export function PageHeader({ title, eyebrow, description, actions, className = "" }: PageHeaderProps) {
  return (
    <header
      className={["flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", className].filter(Boolean).join(" ")}
    >
      <div className="min-w-0 space-y-1">
        {eyebrow ? <div className="mb-2 flex flex-wrap items-center gap-2">{eyebrow}</div> : null}
        <h1 className="font-display text-2xl font-bold tracking-tight text-balance text-brand-primary sm:text-3xl">
          {title}
        </h1>
        {description ? <div className="text-sm text-brand-primary/70 sm:text-base">{description}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 sm:shrink-0">{actions}</div> : null}
    </header>
  );
}
