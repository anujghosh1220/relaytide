import { ArrowRight, CircleCheck, Flag, Plus, RotateCcw, Timer, UserRound, Zap } from 'lucide-react';
import type { ActionType, TicketActivity } from './types';
import { ACTION_LABELS } from './theme';

interface ActionPresentation {
  label: string;
  Icon: typeof Plus;
  /** Timeline node / icon tone. */
  tone: string;
}

const PRESENTATION: Record<ActionType, ActionPresentation> = {
  created: {
    label: ACTION_LABELS.created,
    Icon: Plus,
    tone: 'text-status-open',
  },
  assigned: {
    label: ACTION_LABELS.assigned,
    Icon: UserRound,
    tone: 'text-primary',
  },
  priority_changed: {
    label: ACTION_LABELS.priority_changed,
    Icon: Flag,
    tone: 'text-priority-high',
  },
  status_changed: {
    label: ACTION_LABELS.status_changed,
    Icon: ArrowRight,
    tone: 'text-status-progress',
  },
  first_response: {
    label: ACTION_LABELS.first_response,
    Icon: Zap,
    tone: 'text-status-resolved',
  },
  resolved: {
    label: ACTION_LABELS.resolved,
    Icon: CircleCheck,
    tone: 'text-status-resolved',
  },
  reopened: {
    label: ACTION_LABELS.reopened,
    Icon: RotateCcw,
    tone: 'text-priority-high',
  },
  updated: {
    label: ACTION_LABELS.updated,
    Icon: Timer,
    tone: 'text-muted-foreground',
  },
};

const FALLBACK: ActionPresentation = {
  label: 'Activity recorded',
  Icon: ArrowRight,
  tone: 'text-muted-foreground',
};

export function getActionPresentation(actionType: string): ActionPresentation {
  return PRESENTATION[actionType as ActionType] ?? FALLBACK;
}

const STATUS_WORDS: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

const PRIORITY_WORDS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

/**
 * Turns the JSONB `details` payload into readable key/value rows.
 *
 * `assigned_to` stores a profile UUID; RelayTide only lets users read their own
 * profile row under RLS, so an unresolvable id is described rather than rendered.
 */
export function describeActivityDetails(
  details: Record<string, unknown> | null,
  resolveName?: (id: string) => string | undefined
): Array<{ label: string; value: string }> {
  if (!details) return [];

  return Object.entries(details)
    .filter(([key]) => key !== 'title')
    .map(([key, value]) => {
      if (key === 'new_status') {
        return { label: 'New status', value: STATUS_WORDS[String(value)] ?? String(value) };
      }
      if (key === 'new_priority') {
        return { label: 'New priority', value: PRIORITY_WORDS[String(value)] ?? String(value) };
      }
      if (key === 'assigned_to') {
        if (value === null || value === '') return { label: 'Assignee', value: 'Unassigned' };
        const name = typeof value === 'string' ? resolveName?.(value) : undefined;
        return { label: 'Assignee', value: name ?? 'a team member' };
      }
      return { label: key.replace(/_/g, ' '), value: String(value) };
    })
    .filter((row) => row.value.length > 0);
}

/** Human actor label that never leaks another user's profile data. */
export function describeActor(activity: TicketActivity, currentUserId?: string | null): string {
  if (!activity.actor_id) return 'System';
  if (currentUserId && activity.actor_id === currentUserId) return 'You';
  return 'A team member';
}
