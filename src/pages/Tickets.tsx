import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { Button } from '../components/ui/Button';
import { TicketList } from '../components/tickets/TicketList';
import { useTickets } from '../hooks/useTickets';
import { Link } from 'react-router-dom';

export const Tickets = () => {
  const { tickets, loading, error } = useTickets();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-0 lg:ml-64 overflow-auto">
        <Header title="Tickets" />
        <main className="p-4 lg:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">All Tickets</h2>
            <Link to="/tickets/new">
              <Button>Create Ticket</Button>
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-4">
              {error}
            </div>
          )}

          <TicketList tickets={tickets} loading={loading} />
        </main>
      </div>
    </div>
  );
};
