import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { useAuth } from '../hooks/useAuth';
import { useTickets } from '../hooks/useTickets';
import { TicketDetails } from '../components/tickets/TicketDetails';
import { supabase } from '../lib/supabase';
import type { TicketWithProfile } from '../lib/types';
import { Skeleton } from '../components/ui/Skeleton';

export const TicketDetailsPage = () => {
  const { user, signOut } = useAuth();
  const { updateTicket, deleteTicket, recordFirstResponse, resolveTicket, fetchTickets } = useTickets();
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<TicketWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchTicket = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

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

        if (data) {
          setTicket(data as TicketWithProfile);
        } else {
          setError('Ticket not found');
        }
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
    await fetchTickets();
    // Refetch the specific ticket to get updated data
    const { data } = await supabase
      .from('tickets')
      .select(`
        *,
        created_by_profile:profiles!tickets_created_by_fkey(id, display_name),
        assigned_to_profile:profiles!tickets_assigned_to_fkey(id, display_name)
      `)
      .eq('id', ticketId)
      .single();
    if (data) setTicket(data as TicketWithProfile);
  };

  const handleDelete = async (ticketId: string) => {
    await deleteTicket(ticketId);
  };

  const handleRecordFirstResponse = async (ticketId: string) => {
    await recordFirstResponse(ticketId);
    await fetchTickets();
    const { data } = await supabase
      .from('tickets')
      .select(`
        *,
        created_by_profile:profiles!tickets_created_by_fkey(id, display_name),
        assigned_to_profile:profiles!tickets_assigned_to_fkey(id, display_name)
      `)
      .eq('id', ticketId)
      .single();
    if (data) setTicket(data as TicketWithProfile);
  };

  const handleResolve = async (ticketId: string) => {
    await resolveTicket(ticketId);
    await fetchTickets();
    const { data } = await supabase
      .from('tickets')
      .select(`
        *,
        created_by_profile:profiles!tickets_created_by_fkey(id, display_name),
        assigned_to_profile:profiles!tickets_assigned_to_fkey(id, display_name)
      `)
      .eq('id', ticketId)
      .single();
    if (data) setTicket(data as TicketWithProfile);
  };

  if (loading) {
    return (
      <AppShell
        title="Loading..."
        description="Loading ticket details"
        user={user}
        onSignOut={signOut}
      >
        <div className="space-y-6">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}
          </div>
          <Skeleton className="h-32" />
        </div>
      </AppShell>
    );
  }

  if (error || !ticket) {
    return (
      <AppShell
        title="Ticket Not Found"
        description="The ticket could not be loaded"
        user={user}
        onSignOut={signOut}
      >
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">{error || 'Ticket not found'}</p>
          <Link to="/tickets" className="text-primary hover:underline">
            Back to Tickets
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={ticket.title}
      description={`Ticket ${ticket.id.slice(0, 8)}`}
      user={user}
      onSignOut={signOut}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/tickets" className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block">
            ← Back to Tickets
          </Link>
        </div>
      </div>
      <TicketDetails
        ticket={ticket}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onRecordFirstResponse={handleRecordFirstResponse}
        onResolve={handleResolve}
      />
    </AppShell>
  );
};

export default TicketDetailsPage;