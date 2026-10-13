import type { Ticket, TicketPriority, TicketStatus } from './types';
import { PRIORITY_ORDER } from './theme';

export type SortKey = 'created_at' | 'response_due_at' | 'priority' | 'title' | 'status';
export type SortDirection = 'asc' | 'desc';
export type StatusFilter = TicketStatus | 'all';
export type PriorityFilter = TicketPriority | 'all';

export interface TicketQuery {
  search: string;
  status: StatusFilter;
  priority: PriorityFilter;
  sortKey: SortKey;
  sortDirection: SortDirection;
}

export const defaultQuery: TicketQuery = {
  search: '',
  status: 'all',
  priority: 'all',
  sortKey: 'created_at',
  sortDirection: 'desc',
};

/** Case-insensitive match on title and description, as in the original ticket list. */
export function matchesSearch(ticket: Ticket, search: string): boolean {
  const needle = search.trim().toLowerCase();
  if (!needle) return true;
  return (
    ticket.title.toLowerCase().includes(needle) ||
    ticket.description.toLowerCase().includes(needle)
  );
}

export function filterTickets(tickets: Ticket[], query: Omit<TicketQuery, 'sortKey' | 'sortDirection'>): Ticket[] {
  return tickets.filter(
    (ticket) =>
      matchesSearch(ticket, query.search) &&
      (query.status === 'all' || ticket.status === query.status) &&
      (query.priority === 'all' || ticket.priority === query.priority)
  );
}

/** Values that sort on a "least urgent first" scale. */
const PRIORITY_RANK: Record<TicketPriority, number> = {
  low: PRIORITY_ORDER.indexOf('low'),
  medium: PRIORITY_ORDER.indexOf('medium'),
  high: PRIORITY_ORDER.indexOf('high'),
  critical: PRIORITY_ORDER.indexOf('critical'),
};

const STATUS_RANK: Record<TicketStatus, number> = {
  open: 0,
  in_progress: 1,
  resolved: 2,
  closed: 3,
};

export function sortTickets(tickets: Ticket[], sortKey: SortKey, sortDirection: SortDirection): Ticket[] {
  const factor = sortDirection === 'asc' ? 1 : -1;

  return [...tickets].sort((a, b) => {
    const compare = compareTickets(a, b, sortKey);
    return compare * factor;
  });
}

function compareTickets(a: Ticket, b: Ticket, sortKey: SortKey): number {
  switch (sortKey) {
    case 'priority':
      return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    case 'status':
      return STATUS_RANK[a.status] - STATUS_RANK[b.status];
    case 'title':
      return a.title.localeCompare(b.title);
    case 'response_due_at': {
      // Tickets without a target have no ordering information, so they always sink.
      if (!a.response_due_at && !b.response_due_at) return 0;
      if (!a.response_due_at) return 1;
      if (!b.response_due_at) return -1;
      return new Date(a.response_due_at).getTime() - new Date(b.response_due_at).getTime();
    }
    case 'created_at':
    default:
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  }
}

export function applyQuery(tickets: Ticket[], query: TicketQuery): Ticket[] {
  return sortTickets(filterTickets(tickets, query), query.sortKey, query.sortDirection);
}

/** Flips the direction when the same column is clicked, otherwise starts ascending. */
export function nextSortDirection(query: TicketQuery, sortKey: SortKey): SortDirection {
  if (query.sortKey === sortKey) return query.sortDirection === 'asc' ? 'desc' : 'asc';
  return sortKey === 'created_at' ? 'desc' : 'asc';
}
