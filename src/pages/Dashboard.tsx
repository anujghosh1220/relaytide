import { StatCards } from "../components/dashboard/StatCards";
import { NeedsAttention } from "../components/dashboard/NeedsAttention";
import { RecentActivity } from "../components/dashboard/RecentActivity";
import { WorkloadBreakdown } from "../components/dashboard/WorkloadBreakdown";
import { ActiveTicketGroups } from "../components/dashboard/ActiveTicketGroups";
import { useDashboardStats } from "../hooks/useTickets";
import { useTickets } from "../hooks/useTickets";
import { AppShell } from "../components/layout/AppShell";
import { useAuth } from "../hooks/useAuth";

export const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { tickets, loading: ticketsLoading } = useTickets();
  const stats = useDashboardStats(tickets);

  return (
    <AppShell
      title="Dashboard"
      description="Overview of your incident response metrics"
      user={user}
      onSignOut={signOut}
    >
      <StatCards stats={stats} loading={ticketsLoading} tickets={tickets} />

      <div className="grid gap-6 lg:grid-cols-2">
        <NeedsAttention tickets={tickets} loading={ticketsLoading} />
        <ActiveTicketGroups tickets={tickets} loading={ticketsLoading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity />
        <WorkloadBreakdown tickets={tickets} loading={ticketsLoading} />
      </div>
    </AppShell>
  );
};

export default Dashboard;