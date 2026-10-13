# RelayTide

**Every issue tracked. Every response accountable.**

RelayTide is a lightweight incident and support-response management dashboard that enables teams to record reported problems, assign ownership, track progress, monitor response targets, calculate response times, and maintain a history of ticket activity.

## 🎯 Problem Statement

Without a central tracking system, issues can be forgotten, assigned ambiguously, or resolved without a clear record. RelayTide provides a central workspace where teams can:

- Record an issue as a ticket
- Assign it to a responsible team member
- Set a priority and response target
- Track its current status
- Measure how long it takes to receive a first response
- Identify tickets that have exceeded their response targets
- Record important changes in an activity history
- Review current workload and historical performance

## ✨ Features

### Dashboard
- Real-time metrics: Open tickets, In Progress, Resolved, Overdue
- Average first-response time calculation
- Recent activity timeline
- Prioritized list of tickets needing attention

### Ticket Management
- Create, view, edit, and delete tickets
- Search tickets by title and description
- Filter by status (Open, In Progress, Resolved, Closed)
- Filter by priority (Low, Medium, High, Critical)
- Sort tickets by creation date
- Assign tickets to team members

### Ticket Details
- Complete ticket information display
- Status and priority badges
- Response-time tracking (first response and resolution time)
- Activity history timeline
- Quick actions: Record first response, Mark as resolved
- Edit status and priority inline

### Response-Time Tracking
- First-response time: Duration between ticket creation and first recorded response
- Resolution time: Duration between ticket creation and resolution
- Overdue indicators based on response targets
- Automatic calculations from timestamps

### Activity History
- Append-only audit trail for all ticket changes
- Records: Created, Assigned, Priority Changed, Status Changed, First Response, Resolved, Reopened
- Timestamps and actor information
- Contextual details for each action

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router
- **Backend/Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Testing**: Vitest, React Testing Library
- **Deployment**: Vercel (recommended)

## 📊 Database Schema

### Tables

#### `profiles`
Extends Supabase auth.users with display name.

```sql
- id (UUID, PK, references auth.users)
- display_name (TEXT, NOT NULL)
- created_at (TIMESTAMP)
```

#### `tickets`
Core ticket data with response tracking.

```sql
- id (UUID, PK)
- title (TEXT, NOT NULL)
- description (TEXT, NOT NULL)
- status (TEXT, NOT NULL) - 'open', 'in_progress', 'resolved', 'closed'
- priority (TEXT, NOT NULL) - 'low', 'medium', 'high', 'critical'
- created_by (UUID, FK → profiles, NOT NULL)
- assigned_to (UUID, FK → profiles, nullable)
- created_at (TIMESTAMP, NOT NULL)
- updated_at (TIMESTAMP, NOT NULL)
- first_response_at (TIMESTAMP, nullable)
- resolved_at (TIMESTAMP, nullable)
- response_due_at (TIMESTAMP, nullable)
```

#### `ticket_activities`
Append-only activity history.

```sql
- id (UUID, PK)
- ticket_id (UUID, FK → tickets, NOT NULL)
- actor_id (UUID, FK → profiles, nullable)
- action_type (TEXT, NOT NULL)
- details (JSONB, nullable)
- created_at (TIMESTAMP, NOT NULL)
```

### Security

- **Row Level Security (RLS)** enabled on all tables
- Users can only read tickets they created or are assigned to
- Users can create tickets (created_by = their profile)
- Users can update tickets they created or are assigned to
- Users can delete tickets they created
- Activity history is append-only (no update/delete policies)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier)

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd relaytide
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at https://supabase.com
   - Go to Settings → API
   - Copy the Project URL and anon public key
   - Create a `.env.local` file in the project root:
     ```
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Apply database migration**
   - In Supabase dashboard, go to SQL Editor
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and run the migration

5. **Run the development server**
   ```bash
   npm run dev
   ```
   Open http://localhost:5173

6. **Build for production**
   ```bash
   npm run build
   ```

## 🧪 Testing

```bash
npm run test
```

## 📁 Project Structure

```
relaytide/
├── src/
│   ├── components/
│   │   ├── layout/ (Sidebar, Header)
│   │   ├── tickets/ (TicketList, TicketForm, TicketDetails)
│   │   ├── dashboard/ (DashboardStats, RecentActivity)
│   │   └── ui/ (Button, Input, Select, Badge)
│   ├── pages/ (Dashboard, Tickets, CreateTicket, TicketDetailsPage, Login, Register)
│   ├── lib/ (supabase, types, utils)
│   ├── hooks/ (useAuth, useTickets)
│   └── test/ (setup)
├── supabase/
│   └── migrations/ (001_initial_schema.sql)
└── public/
```

## 🔐 Security Considerations

- **Never commit secrets**: `.env.local` is in `.gitignore`
- **RLS policies**: All database operations protected at the database level
- **Service role key**: Never exposed in client-side code
- **Activity history**: Append-only to prevent audit trail tampering
- **Input validation**: All forms validated before submission
- **Timestamps**: Calculated server-side to prevent manipulation

## 🎨 Design System

- **Primary color**: Deep navy (#0a0d14) for sidebar
- **Accent color**: Electric blue (#3b82f6) for interactive elements
- **Typography**: System fonts for optimal performance
- **Spacing**: Consistent 4px grid system
- **Responsive**: Mobile-first approach with sidebar collapse

## 📝 Known Limitations

- Single-user demo: The current implementation is designed for a single user. Team collaboration features can be added by extending the RLS policies.
- No real-time updates: Dashboard requires manual refresh for new data (can be added with Supabase real-time subscriptions).
- No email notifications: Email alerts for ticket updates are not implemented.
- No file attachments: Tickets do not support file uploads.

## 🚀 Future Improvements

- Real-time dashboard updates using Supabase subscriptions
- Email notifications for ticket assignments and updates
- File attachment support for tickets
- Advanced filtering and sorting options
- Export tickets to CSV
- Team management and organization support
- Custom priority levels and statuses
- Response SLA reports and analytics
- Mobile app (React Native)

## 📄 License

This project is for portfolio demonstration purposes.

## 👤 Author

Built by Anuj Ghosh

Full-Stack Developer | Software Development Engineer I at Vayunex Technologies

## 🎓 Portfolio Context

RelayTide is a portfolio project demonstrating:
- Full-stack development with React and Supabase
- Responsive UI design with Tailwind CSS
- Database design with PostgreSQL and RLS
- Authentication and authorization
- Real-world application architecture
- Clean code practices and TypeScript

---

**Note**: This is a portfolio project for demonstration purposes. It is not intended to replace mature enterprise incident-management platforms.
