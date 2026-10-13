import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import type { Ticket, TicketActivity, TicketWithProfile, DashboardStats } from '../lib/types';
import { computeStats } from '../lib/metrics';

export function useTickets() {
  const [tickets, setTickets] = useState<TicketWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = async () => {
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
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTickets(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (ticket: Omit<Ticket, 'id' | 'created_at' | 'updated_at' | 'first_response_at' | 'resolved_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get or create profile ID
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      // Create profile if it doesn't exist
      if (!profile || profileError) {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
          })
          .select('id')
          .single();

        if (insertError) throw insertError;
        profile = newProfile;
      }

      if (!profile) throw new Error('Profile not found');

      const { data, error } = await supabase
        .from('tickets')
        .insert({
          ...ticket,
          created_by: profile.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Record activity
      await supabase.from('ticket_activities').insert({
        ticket_id: data.id,
        actor_id: profile.id,
        action_type: 'created',
        details: { title: ticket.title },
      });

      await fetchTickets();
      return data;
    } catch (err) {
      throw err;
    }
  };

  const updateTicket = async (id: string, updates: Partial<Ticket>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Record activity for status changes
      if (updates.status) {
        await supabase.from('ticket_activities').insert({
          ticket_id: id,
          actor_id: user.id,
          action_type: 'status_changed',
          details: { new_status: updates.status },
        });
      }

      // Record activity for priority changes
      if (updates.priority) {
        await supabase.from('ticket_activities').insert({
          ticket_id: id,
          actor_id: user.id,
          action_type: 'priority_changed',
          details: { new_priority: updates.priority },
        });
      }

      // Record activity for assignment
      if (updates.assigned_to !== undefined) {
        await supabase.from('ticket_activities').insert({
          ticket_id: id,
          actor_id: user.id,
          action_type: 'assigned',
          details: { assigned_to: updates.assigned_to },
        });
      }

      await fetchTickets();
      return data;
    } catch (err) {
      throw err;
    }
  };

  const deleteTicket = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchTickets();
    } catch (err) {
      throw err;
    }
  };

  const recordFirstResponse = async (ticketId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('tickets')
        .update({ first_response_at: new Date().toISOString() })
        .eq('id', ticketId);

      if (error) throw error;

      await supabase.from('ticket_activities').insert({
        ticket_id: ticketId,
        actor_id: user.id,
        action_type: 'first_response',
        details: {},
      });

      await fetchTickets();
    } catch (err) {
      throw err;
    }
  };

  const resolveTicket = async (ticketId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('tickets')
        .update({ 
          status: 'resolved',
          resolved_at: new Date().toISOString(),
        })
        .eq('id', ticketId);

      if (error) throw error;

      await supabase.from('ticket_activities').insert({
        ticket_id: ticketId,
        actor_id: user.id,
        action_type: 'resolved',
        details: {},
      });

      await fetchTickets();
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return {
    tickets,
    loading,
    error,
    fetchTickets,
    createTicket,
    updateTicket,
    deleteTicket,
    recordFirstResponse,
    resolveTicket,
  };
}

export function useTicketActivities(ticketId: string) {
  const [activities, setActivities] = useState<TicketActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('ticket_activities')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setActivities(data || []);
    } catch (err) {
      // Silently handle errors - might be RLS blocking access
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) {
      fetchActivities();
    }
  }, [ticketId]);

return { activities, loading, fetchActivities };
}

export function useDashboardStats(tickets: TicketWithProfile[]): DashboardStats {
  return useMemo(() => computeStats(tickets as Ticket[]), [tickets]);
}

export function useTicketSearch(active: boolean) {
  const [tickets, setTickets] = useState<TicketWithProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
          .from('tickets')
          .select(`
            *,
            created_by_profile:profiles!tickets_created_by_fkey(id, display_name),
            assigned_to_profile:profiles!tickets_assigned_to_fkey(id, display_name)
          `)
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;
        if (!cancelled) setTickets(data || []);
      } catch {
        if (!cancelled) setTickets([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [active]);

  return { tickets, loading };
}
