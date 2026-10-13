import { TicketForm } from "../components/tickets/TicketForm";
import { useTickets } from "../hooks/useTickets";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { AppShell } from "../components/layout/AppShell";
import { useAuth } from "../hooks/useAuth";

export const CreateTicket = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { createTicket } = useTickets();

  const handleSubmit = async (ticket: any) => {
    await createTicket(ticket);
    navigate("/tickets");
  };

  return (
    <AppShell
      title="Create Ticket"
      description="Submit a new incident ticket"
      user={user}
      onSignOut={signOut}
    >
      <div className="mb-6">
        <Link to="/tickets">
          <Button variant="ghost" size="sm">← Back to Tickets</Button>
        </Link>
      </div>

      <div className="max-w-3xl">
        <div className="bg-surface rounded-lg border border-border p-6">
          <TicketForm
            onSubmit={handleSubmit}
            onCancel={() => navigate("/tickets")}
            submitLabel="Create Ticket"
          />
        </div>
      </div>
    </AppShell>
  );
};

export default CreateTicket;