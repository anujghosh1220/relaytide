import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import type { TicketStatus, TicketPriority } from "../../lib/types";
import {
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
  PRIORITY_BADGE_CLASSES,
  PRIORITY_LABELS,
} from "../../lib/theme";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function BadgeComponent({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

// Support the legacy API used throughout the codebase: <Badge type="status" value="open" />
interface LegacyBadgeProps {
  type: "status" | "priority";
  value: TicketStatus | TicketPriority;
  className?: string;
}

function LegacyBadge({ type, value, className = "" }: LegacyBadgeProps) {
  const isStatus = type === "status";

  const ticketBadgeBase =
    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap";

  return (
    <span
      className={`${ticketBadgeBase} ${
        isStatus
          ? STATUS_BADGE_CLASSES[value as TicketStatus]
          : PRIORITY_BADGE_CLASSES[value as TicketPriority]
      } ${className}`}
    >
      <span
        aria-hidden="true"
        className={`size-1.5 shrink-0 rounded-full ${
          isStatus ? "bg-current opacity-80" : "bg-current opacity-80"
        }`}
      />
      {isStatus
        ? STATUS_LABELS[value as TicketStatus]
        : PRIORITY_LABELS[value as TicketPriority]}
    </span>
  );
}

// Unified Badge component that supports both APIs
export const Badge = Object.assign(
  function BadgeUnified(props: BadgeProps | LegacyBadgeProps) {
    if ("type" in props && "value" in props) {
      return <LegacyBadge {...props} />;
    }
    return <BadgeComponent {...props} />;
  },
  { displayName: "Badge" }
) as React.FC<BadgeProps | LegacyBadgeProps> & {
  displayName: string;
};

export { badgeVariants };

export default Badge;