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

## 📄 Application Pages

### 1. Login Page (`/login`)

**Purpose**: Authenticate existing users and provide access to the application.

**Features**:
- Email and password authentication
- Form validation
- Error message display for failed login attempts
- Link to registration page for new users
- Automatic redirect to dashboard upon successful login
- Responsive design for mobile and desktop

**Fields**:
- Email: User's registered email address
- Password: User's password (minimum 6 characters)

**Behavior**:
- Validates input before submission
- Calls Supabase Auth for authentication
- On success: Redirects to dashboard
- On failure: Displays error message
- Protected route: Redirects unauthenticated users to this page

---

### 2. Register Page (`/register`)

**Purpose**: Allow new users to create an account and get started with RelayTide.

**Features**:
- User registration with display name, email, and password
- Form validation (password matching, minimum length)
- Automatic profile creation in database
- Error message display for registration failures
- Link to login page for existing users
- Responsive design

**Fields**:
- Display Name: User's preferred display name (e.g., "John Doe")
- Email: User's email address (used for authentication)
- Password: User's password (minimum 6 characters)
- Confirm Password: Password confirmation (must match)

**Behavior**:
- Validates display name, email, and password
- Checks password confirmation matches
- Calls Supabase Auth to create user account
- Triggers automatic profile creation via database trigger
- On success: Redirects to dashboard
- On failure: Displays error message

---

### 3. Dashboard Page (`/`)

**Purpose**: Provide an at-a-glance view of ticket metrics, urgent tickets, and recent activity.

**Features**:
- **Statistics Cards**:
  - Open Tickets: Count of tickets with status "open"
  - In Progress: Count of tickets with status "in_progress"
  - Resolved: Count of tickets with status "resolved"
  - Overdue: Count of tickets past their response due date
  - Average First Response Time: Calculated from all tickets with recorded first responses

- **Needs Attention Section**:
  - Lists tickets that are overdue or have high/critical priority
  - Shows ticket title, priority badge, and overdue indicator
  - Clickable cards navigate to ticket details

- **Recent Activity Section**:
  - Shows last 10 activities across all tickets
  - Displays activity type, ticket title, and relative time
  - Updates automatically when new activities are recorded

**Metrics Calculation**:
- All metrics calculated from actual ticket data in database
- Overdue tickets: Past response due date AND no first response AND not resolved/closed
- Average response time: Mean of all first-response times (excludes tickets without first response)
- Loading states: Skeleton loaders while data is being fetched
- Empty states: Helpful messages when no data exists

**Responsive Behavior**:
- Desktop: 4-column grid for stats, 2-column layout for activity sections
- Tablet: 2-column grid for stats, stacked activity sections
- Mobile: 2-column grid for stats, stacked activity sections

---

### 4. Tickets Page (`/tickets`)

**Purpose**: Display all tickets with search, filtering, and sorting capabilities.

**Features**:
- **Search Bar**:
  - Real-time search by ticket title and description
  - Case-insensitive matching
  - Updates results as you type

- **Filter Dropdowns**:
  - Status Filter: All, Open, In Progress, Resolved, Closed
  - Priority Filter: All, Low, Medium, High, Critical
  - Filters can be combined (e.g., Open + High priority)

- **Ticket List**:
  - Card-based layout for each ticket
  - Displays: Title, description preview, creation time, assignee
  - Badges for status and priority
  - Overdue indicator (red badge) for past-due tickets
  - Clickable cards navigate to ticket details

- **Create Ticket Button**:
  - Prominent button in page header
  - Navigates to ticket creation form

**Empty States**:
- No tickets: Displays message with "Create Ticket" button
- No search results: Displays message suggesting filter adjustment

**Loading States**:
- Spinner while fetching tickets
- Maintains state during filter changes

**Responsive Behavior**:
- Desktop: Horizontal filter bar, card grid
- Mobile: Stacked filters, single-column card list

---

### 5. Create Ticket Page (`/tickets/new`)

**Purpose**: Allow users to create new tickets with all required information.

**Features**:
- **Ticket Form**:
  - Title: Text input (minimum 3 characters, required)
  - Description: Textarea (minimum 10 characters, required)
  - Priority: Dropdown (Low, Medium, High, Critical)
  - Status: Dropdown (Open, In Progress, Resolved, Closed)
  - Assign To: Dropdown of all profiles (including "Unassigned")
  - Response Due At: Datetime picker (optional)

- **Form Validation**:
  - Client-side validation before submission
  - Clear error messages for invalid input
  - Disabled submit button during submission

- **Assignment**:
  - Fetches all profiles from database
  - Allows assignment to any team member
  - "Unassigned" option for unassigned tickets

- **Response Target**:
  - Optional datetime for response deadline
  - Used for overdue calculations
  - Displayed in ticket details

**Behavior**:
- On submit: Creates ticket in database
- Records "created" activity in activity history
- Redirects to tickets page on success
- Displays error message on failure
- Cancel button returns to tickets page

**Responsive Behavior**:
- Desktop: Two-column layout for filters (status, priority)
- Mobile: Stacked single-column layout

---

### 6. Ticket Details Page (`/tickets/:id`)

**Purpose**: Display complete ticket information with full editing capabilities and activity history.

**Features**:
- **Ticket Header**:
  - Ticket title (large, prominent)
  - Status badge (color-coded)
  - Priority badge (color-coded)
  - Overdue indicator (if applicable)
  - Edit and Delete buttons

- **Ticket Information**:
  - Description: Full ticket description
  - Created by: Profile display name
  - Created at: Formatted date and time
  - Assigned to: Profile display name or "Unassigned"
  - Last updated: Formatted date and time
  - Response due: Formatted date and time (if set)
  - First response time: Calculated duration (if recorded)
  - Resolution time: Calculated duration (if resolved)

- **Quick Actions**:
  - Record First Response: Sets first_response_at timestamp
  - Mark as Resolved: Sets status to "resolved" and resolved_at timestamp
  - Only shown when applicable (e.g., "Record First Response" hidden if already responded)

- **Inline Editing**:
  - Toggle edit mode with "Edit" button
  - Change status via dropdown
  - Change priority via dropdown
  - Changes save immediately with activity recording
  - Cancel edit mode to exit without changes

- **Activity Timeline**:
  - Chronological list of all ticket activities
  - Each activity shows:
    - Action type (e.g., "created", "status_changed")
    - Actor (who performed the action)
    - Timestamp (relative time)
    - Details (contextual information, e.g., new status value)
  - Vertical timeline with visual indicators
  - Loading state while fetching activities
  - Empty state when no activities exist

- **Delete Confirmation**:
  - Modal dialog before deletion
  - Explains that action cannot be undone
  - Cancel option to abort deletion
  - Delete option to confirm and remove ticket

**Response-Time Calculations**:
- First Response Time: Duration between created_at and first_response_at
- Resolution Time: Duration between created_at and resolved_at
- Displayed in human-readable format (e.g., "18m", "1h 30m")
- Calculated client-side from timestamps

**Security**:
- Only creator or assignee can view ticket
- Only creator can delete ticket
- Only creator or assignee can edit ticket
- All changes recorded in activity history

**Responsive Behavior**:
- Desktop: Two-column layout (ticket info + activity timeline)
- Mobile: Stacked single-column layout

---

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
   git clone https://github.com/anujghosh1220/relaytide.git
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
   - Run this additional policy:
     ```sql
     CREATE POLICY IF NOT EXISTS "Users can insert own profile"
       ON profiles FOR INSERT
       WITH CHECK (auth.uid() = id);
     ```

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

**Test Coverage**:
- `formatRelativeTime`: 4 tests (minutes, hours, days, just now)
- `calculateResponseTime`: 2 tests (18 minutes, 90 minutes)
- `isOverdue`: 5 tests (past due, responded, resolved, no due date, future due)
- `formatDuration`: 3 tests (minutes, hours, hours and minutes)

## 📁 Project Structure

```
relaytide/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx          # Navigation sidebar with mobile collapse
│   │   │   └── Header.tsx           # Page header with title and sign out
│   │   ├── tickets/
│   │   │   ├── TicketList.tsx      # Searchable, filterable ticket list
│   │   │   ├── TicketForm.tsx      # Create/edit ticket form
│   │   │   └── TicketDetails.tsx   # Ticket details with activity timeline
│   │   ├── dashboard/
│   │   │   ├── DashboardStats.tsx  # Statistics cards and avg response time
│   │   │   └── RecentActivity.tsx  # Recent activity feed
│   │   └── ui/
│   │       ├── Button.tsx          # Reusable button component
│   │       ├── Input.tsx           # Reusable input component
│   │       ├── Select.tsx          # Reusable select component
│   │       └── Badge.tsx           # Status and priority badges
│   ├── pages/
│   │   ├── Dashboard.tsx           # Main dashboard page
│   │   ├── Tickets.tsx             # Ticket list page
│   │   ├── CreateTicket.tsx        # Ticket creation page
│   │   ├── TicketDetailsPage.tsx   # Ticket details page
│   │   ├── Login.tsx               # Authentication page
│   │   └── Register.tsx            # Registration page
│   ├── lib/
│   │   ├── supabase.ts             # Supabase client configuration
│   │   ├── types.ts                # TypeScript type definitions
│   │   ├── utils.ts                # Utility functions
│   │   └── utils.test.ts           # Utility function tests
│   ├── hooks/
│   │   ├── useAuth.ts              # Authentication hook
│   │   └── useTickets.ts           # Ticket CRUD and dashboard hooks
│   ├── test/
│   │   └── setup.ts                # Test setup file
│   ├── App.tsx                    # Main app component with routing
│   ├── main.tsx                   # Application entry point
│   └── index.css                  # Global styles and Tailwind imports
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql # Initial database schema
│       └── 002_add_profile_insert_policy.sql # Additional RLS policy
├── public/                        # Static assets
├── .env.example                   # Environment variable template
├── .gitignore                     # Git ignore rules
├── package.json                   # Project dependencies
├── tsconfig.json                  # TypeScript configuration
├── vite.config.ts                 # Vite configuration
├── vitest.config.ts               # Vitest configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── postcss.config.js              # PostCSS configuration
├── README.md                      # This file
├── SECURITY_AUDIT.md              # Security audit report
└── VERIFICATION_SUMMARY.md       # Verification summary
```

## 🔐 Security Considerations

- **Never commit secrets**: `.env.local` is in `.gitignore`
- **RLS policies**: All database operations protected at the database level
- **Service role key**: Never exposed in client-side code
- **Activity history**: Append-only to prevent audit trail tampering
- **Input validation**: All forms validated before submission
- **Timestamps**: Calculated server-side to prevent manipulation
- **Profile creation**: Automatic trigger on user signup with fallback

## 🎨 Design System

- **Primary color**: Deep navy (#0a0d14) for sidebar
- **Accent color**: Electric blue (#3b82f6) for interactive elements
- **Typography**: System fonts for optimal performance
- **Spacing**: Consistent 4px grid system
- **Responsive**: Mobile-first approach with sidebar collapse
- **Components**: Reusable UI components for consistency

### Status Badge Colors
- Open: Blue
- In Progress: Yellow
- Resolved: Green
- Closed: Gray

### Priority Badge Colors
- Low: Gray
- Medium: Blue
- High: Orange
- Critical: Red

## 📝 Known Limitations

- **Single-user demo**: The current implementation is designed for a single user. Team collaboration features can be added by extending the RLS policies.
- **No real-time updates**: Dashboard requires manual refresh for new data (can be added with Supabase real-time subscriptions).
- **No email notifications**: Email alerts for ticket updates are not implemented.
- **No file attachments**: Tickets do not support file uploads.
- **Profile visibility**: All profiles visible in assignment dropdown (acceptable for single-user demo).

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
- Comment system on tickets
- Ticket templates for common issues
- Integration with external tools (Slack, GitHub, etc.)

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
- Security best practices
- Testing strategies
- Production deployment

## 🌐 Live Demo

https://relaytide.vercel.app

## 📚 Additional Documentation

- **SECURITY_AUDIT.md**: Detailed security audit report with verification results
- **VERIFICATION_SUMMARY.md**: Quick summary of verification and testing
- **supabase/migrations/**: Database schema and migrations

---

**Note**: This is a portfolio project for demonstration purposes. It is not intended to replace mature enterprise incident-management platforms.
