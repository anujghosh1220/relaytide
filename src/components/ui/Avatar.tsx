"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "../../lib/utils";

export function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const palette = [
  "bg-primary/25 text-primary",
  "bg-status-resolved/20 text-status-resolved",
  "bg-status-progress/20 text-status-progress",
  "bg-priority-high/20 text-priority-high",
  "bg-status-open/20 text-status-open",
  "bg-priority-critical/20 text-priority-critical",
];

interface AvatarProps {
  name: string;
  className?: string;
}

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ name, className = "", ...props }, ref) => {
    const hash = name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const tone = palette[hash % palette.length];

    return (
      <span
        ref={ref}
        aria-hidden="true"
        className={cn(
          "inline-flex size-9 shrink-0 select-none items-center justify-center rounded-full border border-border text-xs font-semibold",
          tone,
          className,
        )}
        {...props}
      >
        {initialsFor(name)}
      </span>
    );
  }
);
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };

export default Avatar;