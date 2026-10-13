import { useState, useEffect } from 'react';
import type { Ticket, TicketStatus, TicketPriority } from '../../lib/types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';

interface TicketFormProps {
  onSubmit: (ticket: Omit<Ticket, 'id' | 'created_at' | 'updated_at' | 'first_response_at' | 'resolved_at'>) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<Ticket>;
  submitLabel?: string;
}

export const TicketForm = ({ onSubmit, onCancel, initialData, submitLabel = 'Create Ticket' }: TicketFormProps) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [priority, setPriority] = useState<TicketPriority>(initialData?.priority || 'medium');
  const [status, setStatus] = useState<TicketStatus>(initialData?.status || 'open');
  const [assignedTo, setAssignedTo] = useState<string | null>(initialData?.assigned_to || null);
  const [responseDueAt, setResponseDueAt] = useState(initialData?.response_due_at || '');
  const [profiles, setProfiles] = useState<Array<{ id: string; display_name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch profiles for assignment dropdown
  useEffect(() => {
    const fetchProfiles = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, display_name')
        .order('display_name');
      
      if (data) setProfiles(data);
    };
    fetchProfiles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (title.length < 3) {
      setError('Title must be at least 3 characters');
      return;
    }

    if (description.length < 10) {
      setError('Description must be at least 10 characters');
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        title,
        description,
        priority,
        status,
        assigned_to: assignedTo || null,
        response_due_at: responseDueAt || null,
        created_by: initialData?.created_by || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save ticket');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Brief description of the issue"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed description of the issue..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as TicketPriority)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </Select>

        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as TicketStatus)}
        >
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </Select>
      </div>

      <Select
        label="Assign To"
        value={assignedTo || ''}
        onChange={(e) => setAssignedTo(e.target.value || null)}
      >
        <option value="">Unassigned</option>
        {profiles.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.display_name}
          </option>
        ))}
      </Select>

      <Input
        label="Response Due At (Optional)"
        type="datetime-local"
        value={responseDueAt}
        onChange={(e) => setResponseDueAt(e.target.value)}
      />

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
};
