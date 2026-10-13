"use client";

import type { TicketWithProfile } from "../../lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Progress } from "../ui/Progress";
import { Avatar } from "../ui/Avatar";
import { formatRelativeTime } from "../../lib/utils";

interface TicketGroup {
  id: string;
  name: string;
  description: string;
  status: "in_progress" | "in_review" | "planning";
  progress: number;
  tickets: TicketWithProfile[];
  dueDate: string;
}

const STATUS_VARIANT = {
  in_progress: "default",
  in_review: "secondary",
  planning: "outline",
} as const;

function groupTicketsByAssignee(tickets: TicketWithProfile[]): TicketGroup[] {
  const groups = new Map<string, TicketGroup>();

  tickets.forEach((ticket) => {
    const assigneeKey = ticket.assigned_to || "unassigned";
    const assigneeName = ticket.assigned_to_profile?.display_name || "Unassigned";

    if (!groups.has(assigneeKey)) {
      const assigneeTickets = tickets.filter((t) => t.assigned_to === ticket.assigned_to);
      const resolvedCount = assigneeTickets.filter((t) => t.status === "resolved" || t.status === "closed").length;
      const progress = assigneeTickets.length > 0 ? Math.round((resolvedCount / assigneeTickets.length) * 100) : 0;

      groups.set(assigneeKey, {
        id: assigneeKey,
        name: assigneeName,
        description: `${assigneeTickets.length} tickets assigned`,
        status: "in_progress",
        progress,
        tickets: assigneeTickets,
        dueDate: assigneeTickets.length > 0
          ? formatRelativeTime(assigneeTickets[0].created_at)
          : "—",
      });
    }
  });

  return Array.from(groups.values()).slice(0, 5);
}

export const ActiveTicketGroups = ({ tickets, loading }: { tickets: TicketWithProfile[]; loading: boolean }) => {
  const groups = groupTicketsByAssignee(tickets);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Active groups</CardTitle>
        <CardDescription>Ticket progress by assignee</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((index) => (
              <div key={index} className="flex flex-col gap-2 animate-pulse">
                <div className="flex items-center justify-between gap-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-4 bg-muted rounded w-1/4" />
                </div>
                <div className="h-2 bg-muted rounded w-full" />
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <div className="size-6 bg-muted rounded-full" />
                    <div className="size-6 bg-muted rounded-full" />
                  </div>
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : groups.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No assigned tickets yet.
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.id} className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="truncate text-sm font-medium">{group.name}</h3>
                <Badge variant={STATUS_VARIANT[group.status]}>
                  {group.status.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{group.description}</p>
              <div className="flex items-center gap-3">
                <Progress value={group.progress} aria-label={`${group.name} progress`} />
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{group.progress}%</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1">
                  {group.tickets.slice(0, 3).map((member) => (
                    <Avatar
                      key={member.id}
                      name={member.assigned_to_profile?.display_name || "Unassigned"}
                      className="size-6 -ml-1 border-2 border-background"
                    />
                  ))}
                  {group.tickets.length > 3 && (
                    <Avatar
                      name={`+${group.tickets.length - 3}`}
                      className="size-6 -ml-1 border-2 border-background"
                    />
                  )}
                </span>
                <span className="text-xs text-muted-foreground">Created {group.dueDate}</span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveTicketGroups;