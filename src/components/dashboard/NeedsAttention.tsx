import { Link } from 'react-router-dom';
import { ChevronRight, TriangleAlert } from 'lucide-react';
import type { TicketWithProfile } from '../../lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';
import { isTicketOverdue } from '../../lib/metrics';
import { formatRelativeTime } from '../../lib/utils';

interface NeedsAttentionProps {
  tickets: TicketWithProfile[];
  loading: boolean;
}

export const NeedsAttention = ({ tickets, loading }: NeedsAttentionProps) => {
  const urgent = tickets
    .filter((ticket) => isTicketOverdue(ticket) || ticket.priority === 'critical' || ticket.priority === 'high')
    .slice(0, 5);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Needs attention</CardTitle>
        <CardDescription>Overdue, high and critical priority tickets</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </div>
        ) : urgent.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nothing needs attention right now.
          </p>
        ) : (
          <ul className="space-y-2">
            {urgent.map((ticket) => {
              const overdue = isTicketOverdue(ticket);

              return (
                <li key={ticket.id}>
                  <Link
                    to={`/tickets/${ticket.id}`}
                    className="group flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2.5 transition-colors hover:border-border-strong hover:bg-elevated"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{ticket.title}</p>
                      <p className="mt-0.5 flex items-center gap-2 text-xs text-subtle-foreground">
                        <span>Opened {formatRelativeTime(ticket.created_at)}</span>
                        {overdue && (
                          <span className="inline-flex items-center gap-1 font-medium text-priority-critical">
                            <TriangleAlert className="size-3" aria-hidden="true" />
                            Overdue
                          </span>
                        )}
                      </p>
                    </div>
                    <Badge type="priority" value={ticket.priority} />
                    <ChevronRight
                      className="size-4 shrink-0 text-subtle-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default NeedsAttention;
