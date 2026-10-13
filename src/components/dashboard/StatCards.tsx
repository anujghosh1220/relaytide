import { CalendarClock, CircleCheck, Inbox, Timer, TriangleAlert } from "lucide-react";
import type { DashboardStats, Ticket } from "../../lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Skeleton } from "../ui/Skeleton";
import { formatDuration } from "../../lib/utils";
import { hasVolumeData, buildVolumeSeries } from "../../lib/metrics";
import { TicketVolumeChart } from "./TicketVolumeChart";

interface StatCardsProps {
  stats: DashboardStats;
  loading: boolean;
  tickets: Ticket[];
}

const CHART_WINDOW_DAYS = 14;

export const StatCards = ({ stats, loading, tickets }: StatCardsProps) => {
  const series = loading ? [] : buildVolumeSeries(tickets, CHART_WINDOW_DAYS);
  const chartAvailable = hasVolumeData(series);

  const cards = [
    {
      label: "Open Tickets",
      value: stats.totalOpen,
      hint: "Awaiting action",
      Icon: Inbox,
      tone: "text-status-open",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      hint: "Being worked on",
      Icon: Timer,
      tone: "text-status-progress",
    },
    {
      label: "Resolved",
      value: stats.resolved,
      hint: "Marked resolved",
      Icon: CircleCheck,
      tone: "text-status-resolved",
    },
    {
      label: "Overdue",
      value: stats.overdue,
      hint: "Past response target",
      Icon: TriangleAlert,
      tone: stats.overdue > 0 ? "text-priority-critical" : "text-subtle-foreground",
    },
    {
      label: "Avg First Response",
      value:
        stats.avgFirstResponseTime === null
          ? "\u2014"
          : formatDuration(stats.avgFirstResponseTime),
      hint:
        stats.avgFirstResponseTime === null
          ? "No responses recorded"
          : "Mean of recorded first responses",
      Icon: CalendarClock,
      tone: "text-primary",
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[0, 1, 2, 3, 4].map((index) => (
          <Card key={index}>
            <CardHeader className="flex-row items-center justify-between gap-2">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="size-5 rounded-md" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <Card
            key={card.label}
            className="transition-colors hover:border-border-strong focus-within:border-primary/40"
          >
            <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
              <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {card.label}
              </CardTitle>
              <card.Icon className={`size-4 shrink-0 ${card.tone}`} aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <p className="tabular text-2xl font-semibold text-foreground">{card.value}</p>
              <p className="mt-1 text-xs text-subtle-foreground">{card.hint}</p>
            </CardContent>
          </Card>
        ))}

        {!chartAvailable && (
          <p className="text-xs text-subtle-foreground sm:col-span-2 xl:col-span-5">
            Ticket history in the last {CHART_WINDOW_DAYS} days is still building \u2014 the volume
            chart below appears once tickets are created, answered or resolved.
          </p>
        )}
      </div>

      <TicketVolumeChart tickets={tickets} loading={loading} days={CHART_WINDOW_DAYS} />
    </>
  );
};

export default StatCards;