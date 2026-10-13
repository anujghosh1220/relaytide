import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { DashboardStatsComponent, AvgResponseTime } from '../components/dashboard/DashboardStats';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { useDashboardStats } from '../hooks/useTickets';
import { useTickets } from '../hooks/useTickets';
import { isOverdue } from '../lib/utils';
import { Badge } from '../components/ui/Badge';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { stats, loading: statsLoading } = useDashboardStats();
  const { tickets, loading: ticketsLoading } = useTickets();

  const urgentTickets = tickets
    .filter(t => isOverdue(t) || t.priority === 'critical' || t.priority === 'high')
    .slice(0, 5);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-0 lg:ml-64 overflow-auto">
        <Header title="Dashboard" />
        <main className="p-4 lg:p-6 space-y-6">
          {/* Stats Grid */}
          <DashboardStatsComponent stats={stats} loading={statsLoading} />
          
          {/* Average Response Time */}
          <AvgResponseTime stats={stats} loading={statsLoading} />

          <div className="grid grid-cols-1 gap-6">
            {/* Urgent Tickets */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Needs Attention</h2>
              
              {ticketsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : urgentTickets.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No urgent tickets</p>
              ) : (
                <div className="space-y-3">
                  {urgentTickets.map((ticket) => (
                    <Link
                      key={ticket.id}
                      to={`/tickets/${ticket.id}`}
                      className="block p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{ticket.title}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {isOverdue(ticket) && <span className="text-red-600">Overdue</span>}
                          </p>
                        </div>
                        <Badge type="priority" value={ticket.priority} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <RecentActivity />
          </div>
        </main>
      </div>
    </div>
  );
};
