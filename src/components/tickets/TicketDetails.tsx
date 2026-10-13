import { useState } from 'react';
import type { TicketWithProfile } from '../../lib/types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { CopyIcon } from 'lucide-react';
import { formatDateTime, formatDuration, calculateResponseTime, calculateSLAStatus, getHumanReadableTicketId, calculateHealthScore } from '../../lib/utils';
import { useTicketActivities } from '../../hooks/useTickets';

interface TicketDetailsProps {
  ticket: TicketWithProfile;
  onUpdate: (id: string, updates: Partial<TicketWithProfile>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRecordFirstResponse: (id: string) => Promise<void>;
  onResolve: (id: string) => Promise<void>;
}

export const TicketDetails = ({ ticket, onUpdate, onDelete, onRecordFirstResponse, onResolve }: TicketDetailsProps) => {
  const { activities, loading: activitiesLoading } = useTicketActivities(ticket.id);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    await onUpdate(ticket.id, { status: newStatus as any });
  };

  const handlePriorityChange = async (newPriority: string) => {
    await onUpdate(ticket.id, { priority: newPriority as any });
  };

  const handleFirstResponse = async () => {
    await onRecordFirstResponse(ticket.id);
  };

  const handleResolve = async () => {
    await onResolve(ticket.id);
  };

  const handleDelete = async () => {
    await onDelete(ticket.id);
  };

  const getActionLabel = (actionType: string) => {
    const labels: Record<string, string> = {
      created: 'Created this ticket',
      assigned: 'Changed assignment',
      priority_changed: 'Changed priority',
      status_changed: 'Changed status',
      first_response: 'Recorded first response',
      resolved: 'Resolved this ticket',
      reopened: 'Reopened this ticket',
      updated: 'Updated this ticket',
    };
    return labels[actionType] || actionType;
  };

const firstResponseTime = ticket.first_response_at 
  ? calculateResponseTime(ticket.created_at, ticket.first_response_at)
  : null;

const resolutionTime = ticket.resolved_at
  ? calculateResponseTime(ticket.created_at, ticket.resolved_at)
  : null;

const slaStatus = calculateSLAStatus(ticket);
const healthScore = calculateHealthScore(ticket);

  return (
    <div className="space-y-6">
      {/* Ticket Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
<div className="flex items-start justify-between gap-4 mb-4">
           <div className="flex-1">
             <div className="flex items-center gap-3 mb-2">
               <h1 className="text-2xl font-semibold text-gray-900">{ticket.title}</h1>
<div className="flex items-center gap-2">
                   <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-medium">
                     Ticket #{getHumanReadableTicketId(ticket.id)}
                   </div>
                   <button
                     onClick={async () => {
                       await navigator.clipboard.writeText(getHumanReadableTicketId(ticket.id));
                       // Show temporary feedback
                       const originalTitle = document.title;
                       document.title = 'Copied!';
                       setTimeout(() => {
                         document.title = originalTitle;
                       }, 1500);
                     }}
                     className="text-blue-600 hover:text-blue-800 text-xs"
                     title="Copy ticket ID"
                   >
                     <CopyIcon className="h-4 w-4" />
                   </button>
               </div>
             </div>
             <div className="flex items-center gap-3">
               <Badge type="status" value={ticket.status} />
               <Badge type="priority" value={ticket.priority} />
             </div>
           </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
            <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
              Delete
            </Button>
          </div>
        </div>

        <p className="text-gray-700 mb-6">{ticket.description}</p>

        {/* Quick Actions */}
        {!ticket.first_response_at && ticket.status !== 'resolved' && ticket.status !== 'closed' && (
          <div className="mb-4">
            <Button variant="primary" size="sm" onClick={handleFirstResponse}>
              Record First Response
            </Button>
          </div>
        )}

        {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
          <div className="mb-4">
            <Button variant="primary" size="sm" onClick={handleResolve}>
              Mark as Resolved
            </Button>
          </div>
        )}

        {/* Ticket Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Created by:</span>{' '}
            <span className="font-medium">{ticket.created_by_profile?.display_name || 'Unknown'}</span>
          </div>
          <div>
            <span className="text-gray-500">Created at:</span>{' '}
            <span className="font-medium">{formatDateTime(ticket.created_at)}</span>
          </div>
          <div>
            <span className="text-gray-500">Assigned to:</span>{' '}
            <span className="font-medium">{ticket.assigned_to_profile?.display_name || 'Unassigned'}</span>
          </div>
          <div>
            <span className="text-gray-500">Last updated:</span>{' '}
            <span className="font-medium">{formatDateTime(ticket.updated_at)}</span>
          </div>
           {ticket.response_due_at && (
             <div>
               <span className="text-gray-500">Response due:</span>{' '}
               <span className="font-medium">{formatDateTime(ticket.response_due_at)}</span>
             </div>
           )}
           <div>
             <span className="text-gray-500">SLA Status:</span>{' '}
             <span className={`font-medium px-2 py-1 rounded-full text-xs ${
               slaStatus.status === 'plenty' 
                 ? 'bg-blue-100 text-blue-800'
                 : slaStatus.status === 'approaching'
                   ? 'bg-amber-100 text-amber-800'
                   : slaStatus.status === 'overdue'
                     ? 'bg-red-100 text-red-800'
                     : 'bg-green-100 text-green-800'
             }`}>
               {slaStatus.formattedTime}
             </span>
           </div>
          {firstResponseTime && (
            <div>
              <span className="text-gray-500">First response time:</span>{' '}
              <span className="font-medium">{formatDuration(firstResponseTime)}</span>
            </div>
          )}
          {resolutionTime && (
            <div>
              <span className="text-gray-500">Resolution time:</span>{' '}
              <span className="font-medium">{formatDuration(resolutionTime)}</span>
            </div>
          )}
        </div>

        {/* Edit Mode */}
        {isEditing && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={ticket.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div>
              <span className="text-gray-500">Health Score:</span>{' '}
              <span className={`font-medium px-2 py-1 rounded-full text-xs ${healthScore.color}`}>
                {healthScore.label} ({healthScore.score}/100)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity History</h2>
        
        {activitiesLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="inline-block w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : activities.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No activity yet</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  <div className="w-0.5 flex-1 bg-gray-200 mt-1"></div>
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-sm font-medium text-gray-900">{getActionLabel(activity.action_type)}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDateTime(activity.created_at)}</p>
                  {activity.details && Object.keys(activity.details).length > 0 && (
                    <div className="mt-2 text-sm text-gray-600 bg-gray-50 rounded p-2">
                      {Object.entries(activity.details).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key}:</span> {String(value)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Ticket</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this ticket? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
