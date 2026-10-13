export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function calculateResponseTime(
  createdAt: string,
  responseAt: string
): number {
  const created = new Date(createdAt).getTime();
  const responded = new Date(responseAt).getTime();
  return Math.floor((responded - created) / 60000); // minutes
}

export function isOverdue(ticket: {
  response_due_at: string | null;
  first_response_at: string | null;
  status: string;
}): boolean {
  if (!ticket.response_due_at) return false;
  if (ticket.first_response_at) return false;
  if (ticket.status === 'resolved' || ticket.status === 'closed') return false;
  
  return new Date() > new Date(ticket.response_due_at);
}
