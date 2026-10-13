export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type ActionType = 
  | 'created'
  | 'assigned'
  | 'priority_changed'
  | 'status_changed'
  | 'first_response'
  | 'resolved'
  | 'reopened'
  | 'updated';

export interface Profile {
  id: string;
  display_name: string;
  created_at: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_by: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  first_response_at: string | null;
  resolved_at: string | null;
  response_due_at: string | null;
}

export interface TicketActivity {
  id: string;
  ticket_id: string;
  actor_id: string | null;
  action_type: ActionType;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface TicketWithProfile extends Ticket {
  created_by_profile?: Profile;
  assigned_to_profile?: Profile;
}

export interface DashboardStats {
  totalOpen: number;
  inProgress: number;
  resolved: number;
  overdue: number;
  avgFirstResponseTime: number | null;
}
