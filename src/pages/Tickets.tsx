import { TicketsTable } from "../components/tickets/TicketsTable";
import { useTickets } from "../hooks/useTickets";
import { AppShell } from "../components/layout/AppShell";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export const Tickets = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { tickets, loading, error } = useTickets();

  return (
    <AppShell
      title="Tickets"
      description="Manage and track all incident tickets"
      user={user}
      onSignOut={signOut}
    >
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm text-destructive mb-4">
          {error}
        </div>
      )}

      <TicketsTable
        tickets={tickets}
        loading={loading}
        onCreateTicket={() => navigate("/tickets/new")}
      />
    </AppShell>
  );
};

export default Tickets;