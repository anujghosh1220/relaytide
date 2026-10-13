import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { TicketDetails } from '../components/tickets/TicketDetails';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import type { TicketWithProfile } from '../lib/types';
import { useTickets } from '../hooks/useTickets';
import { Link } from 'react-router-dom';

export const TicketDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateTicket, deleteTicket, recordFirstResponse, resolveTicket } = useTickets();
  const [ticket, setTicket] = useState<TicketWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTicket = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError('');

        const { data, error } = await supabase
          .from('tickets')
          .select(`
            *,
            created_by_profile:profiles!tickets_created_by_fkey(id, display_name),
            assigned_to_profile:profiles!tickets_assigned_to_fkey(id, display_name)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        setTicket(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch ticket');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  const handleUpdate = async (ticketId: string, updates: Partial<TicketWithProfile>) => {
    await updateTicket(ticketId, updates);
    // Refetch ticket to get updated data
    const { data } = await supabase
      .from('tickets')
      .select(`
        *,
        created_by_profile:profiles!tickets_created_by_fkey(id, display_name),
        assigned_to_profile:profiles!tickets_assigned_to_fkey(id, display_name)
      `)
      .eq('id', ticketId)
      .single();
    
    if (data) setTicket(data);
  };

  const handleDelete = async (ticketId: string) => {
    await deleteTicket(ticketId);
    navigate('/tickets');
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-0 lg:ml-64 overflow-auto">
          <Header title="Ticket Details" />
          <main className="p-4 lg:p-6">
            <div className="flex items-center justify-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-0 lg:ml-64 overflow-auto">
          <Header title="Ticket Details" />
          <main className="p-4 lg:p-6">
            <div className="mb-6">
              <Link to="/tickets">
                <Button variant="ghost" size="sm">← Back to Tickets</Button>
              </Link>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
              {error || 'Ticket not found'}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-0 lg:ml-64 overflow-auto">
        <Header title="Ticket Details" />
        <main className="p-4 lg:p-6">
          <div className="mb-6">
            <Link to="/tickets">
              <Button variant="ghost" size="sm">← Back to Tickets</Button>
            </Link>
          </div>

          <TicketDetails
            ticket={ticket}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onRecordFirstResponse={recordFirstResponse}
            onResolve={resolveTicket}
          />
        </main>
      </div>
    </div>
  );
};
