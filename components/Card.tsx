import { type HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        "flex flex-col gap-4 rounded-2xl border border-brand-border/50 bg-white p-5",
        "shadow-sm shadow-brand-primary/5 transition-shadow duration-200",
        "hover:shadow-md hover:shadow-brand-primary/10",
        className,
      ].join(" ")}
      {...props}
    />
  );
}

export function CardHeader({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={["space-y-1.5", className].join(" ")} {...props} />;
}

export function CardTitle({ className = "", ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={["font-display text-lg font-semibold leading-tight tracking-tight text-brand-primary", className].join(" ")}
      {...props}
    />
  );
}

export function CardDescription({ className = "", ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={["text-sm leading-relaxed text-brand-primary/70", className].join(" ")} {...props} />;
}

export function CardContent({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={className} {...props} />;
}

export function CardFooter({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={["flex flex-wrap items-center gap-3", className].join(" ")} {...props} />;
}
