import { Link } from 'react-router-dom';
import type { Ticket } from '../../lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import { computePriorityBreakdown, computeStatusBreakdown } from '../../lib/metrics';
import { STATUS_DOT_CLASSES } from '../../lib/theme';

interface WorkloadBreakdownProps {
  tickets: Ticket[];
  loading: boolean;
}

/**
 * Always-available alternative to the trend chart: current workload split by
 * status and priority, computed from the same ticket rows.
 */
export const WorkloadBreakdown = ({ tickets, loading }: WorkloadBreakdownProps) => {
  const statuses = computeStatusBreakdown(tickets);
  const priorities = computePriorityBreakdown(tickets);
  const total = tickets.length;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Current workload</CardTitle>
        <CardDescription>
          {loading ? 'Loading tickets…' : `${total} ${total === 1 ? 'ticket' : 'tickets'} in view`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-6">
        <section className="space-y-3">
          <h4 className="text-xs font-medium uppercase tracking-wide text-subtle-foreground">
            By status
          </h4>
          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2, 3].map((index) => (
                <Skeleton key={index} className="h-6 w-full" />
              ))}
            </div>
          ) : (
            <ul className="space-y-2.5">
              {statuses.map((slice) => (
                <li key={slice.status} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        aria-hidden="true"
                        className={`size-2 shrink-0 rounded-full ${STATUS_DOT_CLASSES[slice.status]}`}
                      />
                      <span className="truncate text-muted-foreground">{slice.label}</span>
                    </span>
                    <span className="tabular shrink-0 font-medium text-foreground">
                      {slice.count}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${STATUS_DOT_CLASSES[slice.status]}`}
                      style={{ width: `${Math.round(slice.share * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3">
          <h4 className="text-xs font-medium uppercase tracking-wide text-subtle-foreground">
            By priority
          </h4>
          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2, 3].map((index) => (
                <Skeleton key={index} className="h-6 w-full" />
              ))}
            </div>
          ) : (
            <ul className="space-y-2.5">
              {priorities.map((slice) => (
                <li key={slice.priority} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-muted-foreground">{slice.label}</span>
                  <span className="tabular shrink-0 font-medium text-foreground">{slice.count}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Link
          to="/tickets"
          className="mt-auto inline-flex items-center text-sm font-medium text-primary transition-colors hover:text-accent-hover"
        >
          View all tickets
        </Link>
      </CardContent>
    </Card>
  );
};

export default WorkloadBreakdown;
