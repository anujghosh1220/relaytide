-- ============================================
-- RelayTide Database Schema
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Profiles Table
-- ============================================
-- This table extends Supabase auth.users with additional profile information
-- A trigger automatically creates a profile when a user signs up

CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Tickets Table
-- ============================================
-- Stores all incident/support tickets with response tracking

CREATE TABLE tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL CHECK (char_length(title) >= 3),
  description TEXT NOT NULL CHECK (char_length(description) >= 10),
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  first_response_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  response_due_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_tickets_created_by ON tickets(created_by);
CREATE INDEX idx_tickets_response_due_at ON tickets(response_due_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Ticket Activities Table
-- ============================================
-- Append-only activity history for tickets
-- This table is designed to be read-only after creation

CREATE TABLE ticket_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'created', 'assigned', 'priority_changed', 'status_changed',
    'first_response', 'resolved', 'reopened', 'updated'
  )),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_ticket_activities_ticket_id ON ticket_activities(ticket_id);
CREATE INDEX idx_ticket_activities_created_at ON ticket_activities(created_at DESC);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_activities ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Profiles RLS Policies
-- ============================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (for manual creation if trigger fails)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- No delete policy - profiles are deleted when auth user is deleted

-- ============================================
-- Tickets RLS Policies
-- ============================================

-- Users can read tickets they created or are assigned to
CREATE POLICY "Users can read own or assigned tickets"
  ON tickets FOR SELECT
  USING (
    auth.uid() = created_by OR
    auth.uid() = assigned_to
  );

-- Users can create tickets (created_by will be set to their profile)
CREATE POLICY "Users can create tickets"
  ON tickets FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Users can update tickets they created or are assigned to
CREATE POLICY "Users can update own or assigned tickets"
  ON tickets FOR UPDATE
  USING (
    auth.uid() = created_by OR
    auth.uid() = assigned_to
  );

-- Users can delete tickets they created
CREATE POLICY "Users can delete own tickets"
  ON tickets FOR DELETE
  USING (auth.uid() = created_by);

-- ============================================
-- Ticket Activities RLS Policies
-- ============================================

-- Users can read activities for tickets they can access
CREATE POLICY "Users can read activities for accessible tickets"
  ON ticket_activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.id = ticket_activities.ticket_id
      AND (auth.uid() = tickets.created_by OR auth.uid() = tickets.assigned_to)
    )
  );

-- Users can insert activities for tickets they can access
CREATE POLICY "Users can insert activities for accessible tickets"
  ON ticket_activities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.id = ticket_activities.ticket_id
      AND (auth.uid() = tickets.created_by OR auth.uid() = tickets.assigned_to)
    )
    AND auth.uid() = actor_id
  );

-- No update or delete policies - activities are append-only
-- This prevents tampering with the audit trail

-- ============================================
-- Helper Functions for Response Time Calculations
-- ============================================

-- Function to calculate first response time in minutes
CREATE OR REPLACE FUNCTION calculate_first_response_minutes(ticket_id UUID)
RETURNS INTEGER AS $$
DECLARE
  created_at TIMESTAMP WITH TIME ZONE;
  first_response_at TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT t.created_at, t.first_response_at
  INTO created_at, first_response_at
  FROM tickets t
  WHERE t.id = ticket_id;
  
  IF first_response_at IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN EXTRACT(EPOCH FROM (first_response_at - created_at)) / 60;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate resolution time in minutes
CREATE OR REPLACE FUNCTION calculate_resolution_minutes(ticket_id UUID)
RETURNS INTEGER AS $$
DECLARE
  created_at TIMESTAMP WITH TIME ZONE;
  resolved_at TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT t.created_at, t.resolved_at
  INTO created_at, resolved_at
  FROM tickets t
  WHERE t.id = ticket_id;
  
  IF resolved_at IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN EXTRACT(EPOCH FROM (resolved_at - created_at)) / 60;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
