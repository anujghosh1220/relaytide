import { useState, useEffect } from 'react';
import type { TicketActivity } from '../../lib/types';
import { formatRelativeTime } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

export const RecentActivity = () => {
  const [activities, setActivities] = useState<(TicketActivity & { ticket_title?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('ticket_activities')
          .select(`
            *,
            tickets(title)
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        const activitiesWithTitles = (data || []).map((activity: any) => ({
          ...activity,
          ticket_title: activity.tickets?.title,
        }));

        setActivities(activitiesWithTitles);
      } catch (err) {
        // Silently handle errors - might be no activities yet
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivities();
  }, []);

  const getActionLabel = (actionType: string) => {
    const labels: Record<string, string> = {
      created: 'created',
      assigned: 'assigned',
      priority_changed: 'changed priority',
      status_changed: 'changed status',
      first_response: 'responded to',
      resolved: 'resolved',
      reopened: 'reopened',
      updated: 'updated',
    };
    return labels[actionType] || actionType;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-gray-200"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <p className="text-gray-500 text-center py-8">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4">
            <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                {activity.ticket_title && (
                  <span className="font-medium">{activity.ticket_title}</span>
                )}{' '}
                was {getActionLabel(activity.action_type)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(activity.created_at)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
