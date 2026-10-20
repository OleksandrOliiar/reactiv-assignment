import { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

export function PanelHeading({
  title,
  description,
  meta,
  action,
  className,
}: {
  title: string;
  description: string;
  meta?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <div className="flex min-w-0 flex-col gap-1">
        <h2 className="flex items-baseline gap-2 text-base font-semibold tracking-tight">
          {title}{' '}
          {meta ? (
            <span className="text-xs font-normal text-muted-foreground tabular-nums">{meta}</span>
          ) : null}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
