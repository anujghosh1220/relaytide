import type { DashboardStats, Ticket, TicketPriority, TicketStatus } from './types';
import { STATUS_LABELS, STATUS_ORDER, PRIORITY_LABELS, PRIORITY_ORDER } from './theme';

export interface VolumePoint {
  /** Local `YYYY-MM-DD` bucket key. */
  date: string;
  /** Axis label, e.g. `Mon`. */
  label: string;
  /** Tooltip label, e.g. `Mon, Oct 12`. */
  fullLabel: string;
  created: number;
  responded: number;
  resolved: number;
}

export interface StatusSlice {
  status: TicketStatus;
  label: string;
  count: number;
  share: number;
}

export interface PrioritySlice {
  priority: TicketPriority;
  label: string;
  count: number;
  share: number;
}

const DAY_MS = 86400000;

export function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Daily ticket volume over the trailing window, bucketed by calendar day.
 *
 * Everything here is derived from timestamps that RelayTide already stores
 * (`created_at`, `first_response_at`, `resolved_at`); nothing is invented.
 */
export function buildVolumeSeries(
  tickets: Ticket[],
  days = 14,
  now: Date = new Date()
): VolumePoint[] {
  const buckets = new Map<string, VolumePoint>();

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = new Date(now.getTime() - offset * DAY_MS);
    const key = toLocalDateKey(day);
    buckets.set(key, {
      date: key,
      label: day.toLocaleDateString('en-US', { weekday: 'short' }),
      fullLabel: day.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
      created: 0,
      responded: 0,
      resolved: 0,
    });
  }

  const bump = (value: string | null, field: keyof Pick<VolumePoint, 'created' | 'responded' | 'resolved'>) => {
    if (!value) return;
    const point = buckets.get(toLocalDateKey(new Date(value)));
    if (point) point[field] += 1;
  };

  for (const ticket of tickets) {
    bump(ticket.created_at, 'created');
    bump(ticket.first_response_at, 'responded');
    bump(ticket.resolved_at, 'resolved');
  }

  return [...buckets.values()];
}

/** True when the chart window contains at least one real event to plot. */
export function hasVolumeData(series: VolumePoint[]): boolean {
  return series.some((point) => point.created + point.responded + point.resolved > 0);
}

export function computeStatusBreakdown(tickets: Ticket[]): StatusSlice[] {
  const total = tickets.length;

  return STATUS_ORDER.map((status) => {
    const count = tickets.filter((ticket) => ticket.status === status).length;
    return {
      status,
      label: STATUS_LABELS[status],
      count,
      share: total === 0 ? 0 : count / total,
    };
  });
}

export function computePriorityBreakdown(tickets: Ticket[]): PrioritySlice[] {
  const total = tickets.length;

  return PRIORITY_ORDER.map((priority) => {
    const count = tickets.filter((ticket) => ticket.priority === priority).length;
    return {
      priority,
      label: PRIORITY_LABELS[priority],
      count,
      share: total === 0 ? 0 : count / total,
    };
  });
}

/** Same rules as `isOverdue`, applied to a whole workload. */
export function isTicketOverdue(ticket: Ticket, now: Date = new Date()): boolean {
  if (!ticket.response_due_at) return false;
  if (ticket.first_response_at) return false;
  if (ticket.status === 'resolved' || ticket.status === 'closed') return false;
  return new Date(ticket.response_due_at).getTime() < now.getTime();
}

/** Mirrors the existing dashboard calculations in `useDashboardStats`. */
export function computeStats(tickets: Ticket[], now: Date = new Date()): DashboardStats {
  const totalOpen = tickets.filter((ticket) => ticket.status === 'open').length;
  const inProgress = tickets.filter((ticket) => ticket.status === 'in_progress').length;
  const resolved = tickets.filter((ticket) => ticket.status === 'resolved').length;
  const overdue = tickets.filter((ticket) => isTicketOverdue(ticket, now)).length;

  const withResponse = tickets.filter((ticket) => ticket.first_response_at !== null);
  const avgFirstResponseTime =
    withResponse.length === 0
      ? null
      : Math.round(
          withResponse.reduce((sum, ticket) => {
            const created = new Date(ticket.created_at).getTime();
            const responded = new Date(ticket.first_response_at as string).getTime();
            return sum + (responded - created) / 60000;
          }, 0) / withResponse.length
        );

  return { totalOpen, inProgress, resolved, overdue, avgFirstResponseTime };
}
