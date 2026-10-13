"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/Card";
import { ACTION_LABELS, ACTION_VERBS } from "../../lib/theme";
import { cn } from "../../lib/utils";
import { supabase } from "../../lib/supabase";
import { formatDateTime } from "../../lib/utils";
import { useState, useEffect } from "react";

const actionColors: Record<string, string> = {
  created: "bg-primary/10 text-primary border-primary/20",
  assigned: "bg-status-progress/10 text-status-progress border-status-progress/20",
  priority_changed: "bg-priority-high/10 text-priority-high border-priority-high/20",
  status_changed: "bg-status-open/10 text-status-open border-status-open/20",
  first_response: "bg-status-resolved/10 text-status-resolved border-status-resolved/20",
  resolved: "bg-status-resolved/10 text-status-resolved border-status-resolved/20",
  reopened: "bg-warning/10 text-warning border-warning/20",
  updated: "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20",
};

const actionIcons: Record<string, React.ReactNode> = {
  created: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  ),
  assigned: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-status-progress">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <line x1="20" x2="20.01" y1="8" y2="8"></line>
    </svg>
  ),
  priority_changed: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-priority-high">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
  ),
  status_changed: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-status-open">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
      <line x1="12" x2="12" y1="9" y2="13"></line>
      <line x1="12" x2="12.01" y1="17" y2="17"></line>
    </svg>
  ),
  first_response: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-status-resolved">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  ),
  resolved: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-status-resolved">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  ),
  reopened: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-warning">
      <path d="M21 13.2A8.5 8.5 0 1 1 10.8 3a7 7 0 0 0 10.2 10.2Z"></path>
    </svg>
  ),
  updated: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
      <path d="M12 22h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"></path>
      <path d="M2 12h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z"></path>
    </svg>
  ),
};

interface ActivityEntry {
  id: string;
  actionType: string;
  actionLabel: string;
  actionVerb: string;
  details: Record<string, unknown> | null;
  createdAt: string;
  ticketTitle?: string;
  actorName?: string;
}

interface ActivityTimelineProps {
  limit?: number;
  ticketId?: string;
}

export const ActivityTimeline = ({ limit = 20, ticketId }: ActivityTimelineProps) => {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);

        let query = supabase
          .from("ticket_activities")
          .select(`
            *,
            tickets(title),
            actor:profiles!ticket_activities_actor_id_fkey(display_name)
          `)
          .order("created_at", { ascending: false })
          .limit(limit);

        if (ticketId) {
          query = query.eq("ticket_id", ticketId);
        }

        const { data, error } = await query;

        if (error) throw error;

        const activitiesWithDetails = (data || []).map((activity: any) => ({
          id: activity.id,
          actionType: activity.action_type,
          actionLabel: ACTION_LABELS[activity.action_type as keyof typeof ACTION_LABELS] || activity.action_type,
          actionVerb: ACTION_VERBS[activity.action_type as keyof typeof ACTION_VERBS] || activity.action_type,
          details: activity.details,
          createdAt: activity.created_at,
          ticketTitle: activity.tickets?.title,
          actorName: activity.actor?.display_name,
        }));

        setActivities(activitiesWithDetails);
      } catch (err) {
        console.error("Failed to fetch activities:", err);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [limit, ticketId]);

  const getDetailLines = (details: Record<string, unknown> | null) => {
    if (!details || Object.keys(details).length === 0) return [];
    return Object.entries(details).map(([key, value]) => ({
      key,
      label: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      value: String(value),
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>Recent ticket activity and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>Recent ticket activity and updates</CardDescription>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          No activity recorded yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
        <CardDescription>Recent ticket activity and updates</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative">
          <div className="absolute left-[22px] top-0 bottom-0 w-0.5 bg-border" aria-hidden="true" />
          <dl className="space-y-0">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <div className="relative flex gap-4 px-4 py-4 first:pt-0 last:pb-0">
                  <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full border-2 border-background flex items-center justify-center">
                    {actionIcons[activity.actionType] || (
                      <div
                        className={cn(
                          "w-3 h-3 rounded-full",
                          actionColors[activity.actionType] || "bg-muted-foreground"
                        )}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <dt className="text-sm font-medium text-foreground">
                        {activity.actionLabel}
                      </dt>
                      {activity.ticketTitle && (
                        <>
                          <span className="text-xs text-muted-foreground">on</span>
                          <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                            {activity.ticketTitle}
                          </span>
                        </>
                      )}
                    </div>
                    <dd className="text-sm text-muted-foreground">
                      {activity.actorName && (
                        <>
                          <span className="font-medium">{activity.actorName}</span>
                          <span> · </span>
                        </>
                      )}
                      <time dateTime={activity.createdAt}>
                        {formatDateTime(activity.createdAt)}
                      </time>
                    </dd>
                    {activity.details && Object.keys(activity.details).length > 0 && (
                      <div className="mt-2 pl-12 border-l border-border/50 ml-5">
                        {getDetailLines(activity.details).map((detail) => (
                          <div key={detail.key} className="text-xs text-muted-foreground py-0.5">
                            <span className="font-medium text-subtle-foreground">{detail.label}:</span>{" "}
                            {detail.value}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </dl>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityTimeline;