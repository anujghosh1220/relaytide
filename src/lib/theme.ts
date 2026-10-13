import type { TicketPriority, TicketStatus, ActionType } from './types';

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const STATUS_ORDER: TicketStatus[] = ['open', 'in_progress', 'resolved', 'closed'];

export const PRIORITY_ORDER: TicketPriority[] = ['low', 'medium', 'high', 'critical'];

/**
 * Badge class pairs are written out literally (never composed) so Tailwind can
 * see every class name during its content scan.
 */
export const STATUS_BADGE_CLASSES: Record<TicketStatus, string> = {
  open: 'border-status-open/30 bg-status-open/15 text-status-open',
  in_progress: 'border-status-progress/30 bg-status-progress/15 text-status-progress',
  resolved: 'border-status-resolved/30 bg-status-resolved/15 text-status-resolved',
  closed: 'border-status-closed/30 bg-status-closed/15 text-status-closed',
};

export const PRIORITY_BADGE_CLASSES: Record<TicketPriority, string> = {
  low: 'border-priority-low/30 bg-priority-low/15 text-priority-low',
  medium: 'border-priority-medium/30 bg-priority-medium/15 text-priority-medium',
  high: 'border-priority-high/30 bg-priority-high/15 text-priority-high',
  critical: 'border-priority-critical/30 bg-priority-critical/15 text-priority-critical',
};

export const STATUS_DOT_CLASSES: Record<TicketStatus, string> = {
  open: 'bg-status-open',
  in_progress: 'bg-status-progress',
  resolved: 'bg-status-resolved',
  closed: 'bg-status-closed',
};

export const ACTION_LABELS: Record<ActionType, string> = {
  created: 'Ticket created',
  assigned: 'Assignment updated',
  priority_changed: 'Priority changed',
  status_changed: 'Status changed',
  first_response: 'First response recorded',
  resolved: 'Ticket resolved',
  reopened: 'Ticket reopened',
  updated: 'Ticket updated',
};

/** Short verbs used in dense list rows, e.g. "created", "resolved". */
export const ACTION_VERBS: Record<ActionType, string> = {
  created: 'created',
  assigned: 'assigned',
  priority_changed: 'changed priority',
  status_changed: 'changed status',
  first_response: 'responded to',
  resolved: 'resolved',
  reopened: 'reopened',
  updated: 'updated',
};
