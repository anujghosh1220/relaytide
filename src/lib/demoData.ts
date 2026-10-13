import type { TicketWithProfile } from "./types";
export const demoTickets: TicketWithProfile[] = [
  {
    id: "demo-1",
    title: "Website down for customers",
    description: "Customers are reporting that the e-commerce website is completely inaccessible. Error 503 when trying to access any pages.",
    status: "open",
    priority: "critical",
    created_by: "demo-user-1",
    assigned_to: "demo-user-2",
    created_at: "2026-10-10T08:30:00Z",
    updated_at: "2026-10-10T09:15:00Z",
    first_response_at: null,
    resolved_at: null,
    response_due_at: "2026-10-10T12:30:00Z", // 4 hours from creation
    created_by_profile: {
      id: "demo-user-1",
      display_name: "Alex Johnson",
      created_at: "2026-01-15T08:00:00Z"
    },
     assigned_to_profile: {
       id: "demo-user-2",
       display_name: "Sam Wilson",
       created_at: "2026-01-20T09:00:00Z"
     },
   },
  {
    id: "demo-2",
    title: "Login page throwing 500 error",
    description: "Users are unable to log in to the member portal. The login form is showing a generic 500 error after submission.",
    status: "in_progress",
    priority: "high",
    created_by: "demo-user-3",
    assigned_to: "demo-user-1",
    created_at: "2026-10-11T14:20:00Z",
    updated_at: "2026-10-11T16:45:00Z",
    first_response_at: "2026-10-11T15:00:00Z", // 40 minutes after creation
    resolved_at: null,
    response_due_at: "2026-10-11T18:20:00Z", // 4 hours from creation
    created_by_profile: {
      id: "demo-user-3",
      display_name: "Taylor Chen",
      created_at: "2026-02-01T10:00:00Z"
    },
     assigned_to_profile: {
       id: "demo-user-1",
       display_name: "Alex Johnson",
       created_at: "2026-01-15T08:00:00Z"
     },
   },
  {
    id: "demo-3",
    title: "Feature request: Dark mode toggle",
    description: "Users are requesting a dark mode option for better readability in low-light environments.",
    status: "open",
    priority: "low",
    created_by: "demo-user-4",
    assigned_to: null,
    created_at: "2026-10-09T10:15:00Z",
    updated_at: "2026-10-09T10:15:00Z",
    first_response_at: null,
    resolved_at: null,
    response_due_at: "2026-10-16T10:15:00Z", // 1 week from creation
    created_by_profile: {
      id: "demo-user-4",
      display_name: "Jordan Martinez",
      created_at: "2026-02-10T11:00:00Z"
    },
     assigned_to_profile: undefined
  },
  {
    id: "demo-4",
    title: "Database connection timeout",
    description: "Intermittent database connection timeouts causing slow response times for 10-20% of requests.",
    status: "open",
    priority: "high",
    created_by: "demo-user-2",
    assigned_to: "demo-user-3",
    created_at: "2026-10-12T07:45:00Z",
    updated_at: "2026-10-12T08:30:00Z",
    first_response_at: "2026-10-12T08:00:00Z", // 15 minutes after creation
    resolved_at: null,
    response_due_at: "2026-10-12T11:45:00Z", // 4 hours from creation
    created_by_profile: {
      id: "demo-user-2",
      display_name: "Sam Wilson",
      created_at: "2026-01-20T09:00:00Z"
    },
     assigned_to_profile: {
       id: "demo-user-3",
       display_name: "Taylor Chen",
       created_at: "2026-02-01T10:00:00Z"
     },
   },
  {
    id: "demo-5",
    title: "Mobile app crash on iOS 17",
    description: "The iOS mobile app is crashing immediately on launch for users who updated to iOS 17.0. Affects approximately 15% of iOS users.",
    status: "resolved",
    priority: "high",
    created_by: "demo-user-1",
    assigned_to: "demo-user-4",
    created_at: "2026-10-08T16:20:00Z",
    updated_at: "2026-10-09T11:30:00Z",
    first_response_at: "2026-10-08T16:45:00Z", // 25 minutes after creation
    resolved_at: "2026-10-09T11:30:00Z",
    response_due_at: "2026-10-08T20:20:00Z", // 4 hours from creation
    created_by_profile: {
      id: "demo-user-1",
      display_name: "Alex Johnson",
      created_at: "2026-01-15T08:00:00Z"
    },
     assigned_to_profile: {
       id: "demo-user-4",
       display_name: "Jordan Martinez",
       created_at: "2026-02-10T11:00:00Z"
     },
   },
  {
    id: "demo-6",
    title: "Email notifications not sending",
    description: "Users are not receiving automated email notifications for password resets and account updates.",
    status: "open",
    priority: "medium",
    created_by: "demo-user-5",
    assigned_to: "demo-user-2",
    created_at: "2026-10-13T09:00:00Z",
    updated_at: "2026-10-13T09:00:00Z",
    first_response_at: null,
    resolved_at: null,
    response_due_at: "2026-10-13T13:00:00Z", // 4 hours from creation
    created_by_profile: {
      id: "demo-user-5",
      display_name: "Casey Taylor",
      created_at: "2026-03-01T14:00:00Z"
    },
     assigned_to_profile: {
       id: "demo-user-2",
       display_name: "Sam Wilson",
       created_at: "2026-01-20T09:00:00Z"
     },
   }
];

export const demoActivities: Record<string, any[]> = {
  "demo-1": [
    {
      id: "act-1",
      ticket_id: "demo-1",
      actor_id: "demo-user-1",
      action_type: "created",
      details: { title: "Website down for customers" },
      created_at: "2026-10-10T08:30:00Z"
    }
  ],
  "demo-2": [
    {
      id: "act-2",
      ticket_id: "demo-2",
      actor_id: "demo-user-3",
      action_type: "created",
      details: { title: "Login page throwing 500 error" },
      created_at: "2026-10-11T14:20:00Z"
    },
    {
      id: "act-3",
      ticket_id: "demo-2",
      actor_id: "demo-user-3",
      action_type: "first_response",
      details: {},
      created_at: "2026-10-11T15:00:00Z"
    },
    {
      id: "act-4",
      ticket_id: "demo-2",
      actor_id: "demo-user-1",
      action_type: "assigned",
      details: { assigned_to: "demo-user-1" },
      created_at: "2026-10-11T15:30:00Z"
    }
  ],
  "demo-5": [
    {
      id: "act-5",
      ticket_id: "demo-5",
      actor_id: "demo-user-1",
      action_type: "created",
      details: { title: "Mobile app crash on iOS 17" },
      created_at: "2026-10-08T16:20:00Z"
    },
    {
      id: "act-6",
      ticket_id: "demo-5",
      actor_id: "demo-user-1",
      action_type: "first_response",
      details: {},
      created_at: "2026-10-08T16:45:00Z"
    },
    {
      id: "act-7",
      ticket_id: "demo-5",
      actor_id: "demo-user-4",
      action_type: "assigned",
      details: { assigned_to: "demo-user-4" },
      created_at: "2026-10-08T17:00:00Z"
    },
    {
      id: "act-8",
      ticket_id: "demo-5",
      actor_id: "demo-user-4",
      action_type: "resolved",
      details: {},
      created_at: "2026-10-09T11:30:00Z"
    }
  ]
};