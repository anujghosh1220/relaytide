import type { TicketStatus, TicketPriority } from '../../lib/types';

interface BadgeProps {
  type: 'status' | 'priority';
  value: TicketStatus | TicketPriority;
}

const statusColors: Record<TicketStatus, string> = {
  open: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

const priorityColors: Record<TicketPriority, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const statusLabels: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

const priorityLabels: Record<TicketPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const Badge = ({ type, value }: BadgeProps) => {
  const colors = type === 'status' ? statusColors : priorityColors;
  const labels = type === 'status' ? statusLabels : priorityLabels;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[value as keyof typeof colors]}`}>
      {labels[value as keyof typeof labels]}
    </span>
  );
};
