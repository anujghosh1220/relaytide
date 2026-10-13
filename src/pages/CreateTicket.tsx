import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { Button } from '../components/ui/Button';
import { TicketForm } from '../components/tickets/TicketForm';
import { useTickets } from '../hooks/useTickets';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export const CreateTicket = () => {
  const navigate = useNavigate();
  const { createTicket } = useTickets();

  const handleSubmit = async (ticket: any) => {
    await createTicket(ticket);
    navigate('/tickets');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-0 lg:ml-64 overflow-auto">
        <Header title="Create Ticket" />
        <main className="p-4 lg:p-6">
          <div className="mb-6">
            <Link to="/tickets">
              <Button variant="ghost" size="sm">← Back to Tickets</Button>
            </Link>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <TicketForm
              onSubmit={handleSubmit}
              onCancel={() => navigate('/tickets')}
              submitLabel="Create Ticket"
            />
          </div>
        </main>
      </div>
    </div>
  );
};
