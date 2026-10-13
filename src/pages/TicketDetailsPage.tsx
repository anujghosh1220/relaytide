import { AppShell } from "../components/layout/AppShell";
import { useAuth } from "../hooks/useAuth";

export const TicketDetailsPage = () => {
  const { user, signOut } = useAuth();

  return (
    <AppShell
      title="Ticket Details"
      description="View and manage ticket details"
      user={user}
      onSignOut={signOut}
    >
      <div className="text-center py-12 text-muted-foreground">
        Ticket detail view - would be connected to router params
      </div>
    </AppShell>
  );
};

export default TicketDetailsPage;