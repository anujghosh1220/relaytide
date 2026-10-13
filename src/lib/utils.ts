import type { TicketStatus, TicketPriority } from "./types";

// Helper function to check if demo mode is enabled
export const isDemoMode = () => {
  if (typeof window === 'undefined') return false;
  // Check query parameter
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('demo') === 'true') return true;
  // Check localStorage flag
  return localStorage.getItem('relaytide.demoMode') === 'true';
};

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function calculateResponseTime(
  createdAt: string,
  responseAt: string
): number {
  const created = new Date(createdAt).getTime();
  const responded = new Date(responseAt).getTime();
  return Math.floor((responded - created) / 60000); // minutes
}

export function isOverdue(ticket: {
  response_due_at: string | null;
  first_response_at: string | null;
  status: string;
}): boolean {
  if (!ticket.response_due_at) return false;
  if (ticket.first_response_at) return false;
  if (ticket.status === 'resolved' || ticket.status === 'closed') return false;
  
  return new Date() > new Date(ticket.response_due_at);
}

export function calculateSLAStatus(ticket: {
  response_due_at: string | null;
  first_response_at: string | null;
  status: string;
}): {
  status: 'plenty' | 'approaching' | 'overdue' | 'responded';
  minutesLeft: number | null;
  formattedTime: string;
} {
  // If first response recorded, show responded state
  if (ticket.first_response_at) {
    return {
      status: 'responded',
      minutesLeft: null,
      formattedTime: 'First response recorded'
    };
  }
  
  // If no response due date, show plenty (no deadline)
  if (!ticket.response_due_at) {
    return {
      status: 'plenty',
      minutesLeft: null,
      formattedTime: 'No deadline set'
    };
  }
  
  // If resolved/closed, show responded (even if no first response)
  if (ticket.status === 'resolved' || ticket.status === 'closed') {
    return {
      status: 'responded',
      minutesLeft: null,
      formattedTime: 'Ticket resolved/closed'
    };
  }
  
  const dueDate = new Date(ticket.response_due_at);
  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();
  const minutesLeft = Math.floor(diffMs / 60000);
  
  // If overdue
  if (minutesLeft < 0) {
    return {
      status: 'overdue',
      minutesLeft: Math.abs(minutesLeft), // Show how long overdue
      formattedTime: `${Math.abs(minutesLeft)}m overdue`
    };
  }
  
  // Define thresholds (in minutes)
  const APPROACHING_THRESHOLD = 30; // Amber when <= 30 minutes left
  
  if (minutesLeft <= APPROACHING_THRESHOLD) {
    return {
      status: 'approaching',
      minutesLeft,
      formattedTime: `${minutesLeft}m remaining`
    };
  }
  
  // Plenty of time left
  return {
    status: 'plenty',
    minutesLeft,
    formattedTime: `${minutesLeft}m remaining`
  };
}

export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(" ");
}

// Human-readable ticket ID utilities
const TICKET_ID_MAP_KEY = 'relaytide.ticketIdMap';

export function getTicketIdMap(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const map = localStorage.getItem(TICKET_ID_MAP_KEY);
    return map ? JSON.parse(map) : {};
  } catch (e) {
    console.warn('Failed to parse ticket ID map:', e);
    return {};
  }
}

export function saveTicketIdMap(map: Record<string, string>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TICKET_ID_MAP_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn('Failed to save ticket ID map:', e);
  }
}

export function getHumanReadableTicketId(ticketId: string): string {
  const idMap = getTicketIdMap();
  
  // If we already have a mapping, return it
  if (idMap[ticketId]) {
    return idMap[ticketId];
  }
  
  // Generate a new ID based on the count of existing tickets
  const nextNumber = Object.keys(idMap).length + 1;
  const humanReadableId = `RT-${String(nextNumber).padStart(4, '0')}`;
  
  // Save the new mapping
  idMap[ticketId] = humanReadableId;
  saveTicketIdMap(idMap);
  
  return humanReadableId;
}

// Saved ticket views utilities
const SAVED_VIEWS_KEY = 'relaytide.savedViews';

export interface SavedView {
  id: string;
  name: string;
  search: string;
  statusFilter: TicketStatus | "all";
  priorityFilter: TicketPriority | "all";
  sortKey: string;
  sortDirection: "asc" | "desc";
  createdAt: string;
}

export function getSavedViews(): SavedView[] {
  if (typeof window === 'undefined') return [];
  try {
    const views = localStorage.getItem(SAVED_VIEWS_KEY);
    return views ? JSON.parse(views) : [];
  } catch (e) {
    console.warn('Failed to parse saved views:', e);
    return [];
  }
}

export function saveView(view: Omit<SavedView, 'id' | 'createdAt'>): void {
  if (typeof window === 'undefined') return;
  try {
    const views = getSavedViews();
    const newView: SavedView = {
      ...view,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    // Avoid duplicate names
    const filteredViews = views.filter(v => v.name !== newView.name);
    const updatedViews = [...filteredViews, newView];
    localStorage.setItem(SAVED_VIEWS_KEY, JSON.stringify(updatedViews));
  } catch (e) {
    console.warn('Failed to save view:', e);
  }
}

export function deleteView(viewId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const views = getSavedViews();
    const filteredViews = views.filter(v => v.id !== viewId);
    localStorage.setItem(SAVED_VIEWS_KEY, JSON.stringify(filteredViews));
  } catch (e) {
    console.warn('Failed to delete view:', e);
  }
}

// Incident health score utilities
export function calculateHealthScore(ticket: {
  response_due_at: string | null;
  first_response_at: string | null;
  status: string;
  priority: TicketPriority;
}): {
  score: number; // 0-100
  label: string; // Excellent, Good, Fair, Poor, Critical
  color: string; // Tailwind color class
  factors: {
    deadlineScore: number; // 0-40
    priorityScore: number; // 0-30
    responseScore: number; // 0-30
  };
  explanation: string;
} {
  // Deadline score (0-40 points)
  let deadlineScore = 40; // Start with max
   const hasDueDate = ticket.response_due_at !== null;
   const hasFirstResponse = ticket.first_response_at !== null;
   const isResolvedOrClosed = ticket.status === 'resolved' || ticket.status === 'closed';
   
   if (!hasDueDate) {
     // No deadline = neutral score (20/40)
     deadlineScore = 20;
   } else if (isResolvedOrClosed || hasFirstResponse) {
     // Has response or resolved = good (40/40)
     deadlineScore = 40;
   } else {
     // Has deadline but no response - check if overdue
     const dueDate = new Date(ticket.response_due_at!); // Non-null assertion since we checked hasDueDate
     const now = new Date();
     const isOverdue = now > dueDate;
    
    if (isOverdue) {
      // Overdue = poor score (0-20 based on how overdue)
      const overdueHours = (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60);
      deadlineScore = Math.max(0, 20 - Math.min(20, overdueHours)); // Lose 1 point per hour overdue, min 0
    } else {
      // Not overdue but no response = based on time left
      const timeLeftHours = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      // Full points if >24h left, proportional if <24h
      deadlineScore = Math.min(40, 20 + (timeLeftHours / 24 * 20)); // 20-40 points
    }
  }
  
  // Priority score (0-30 points) - Lower priority = better health
  const priorityScores: Record<TicketPriority, number> = {
    low: 30,
    medium: 20,
    high: 10,
    critical: 0
  };
  const priorityScore = priorityScores[ticket.priority];
  
  // Response score (0-30 points) - Has response = better health
  const responseScore = hasFirstResponse ? 30 : 0;
  
  // Calculate total score
  const totalScore = Math.floor(deadlineScore + priorityScore + responseScore);
  
  // Determine label and color
  let label: string;
  let color: string;
  
  if (totalScore >= 85) {
    label = "Excellent";
    color = "bg-green-100 text-green-800";
  } else if (totalScore >= 70) {
    label = "Good";
    color = "bg-blue-100 text-blue-800";
  } else if (totalScore >= 50) {
    label = "Fair";
    color = "bg-yellow-100 text-yellow-800";
  } else if (totalScore >= 30) {
    label = "Poor";
    color = "bg-amber-100 text-amber-800";
  } else {
    label = "Critical";
    color = "bg-red-100 text-red-800";
  }
  
   // Generate explanation
   let explanation = "";
   if (!hasDueDate) {
     explanation += "No response deadline set. ";
   } else if (isResolvedOrClosed || hasFirstResponse) {
     explanation += "Response recorded or ticket resolved. ";
   } else {
     const dueDate = new Date(ticket.response_due_at!); // Non-null assertion since we checked hasDueDate
     const now = new Date();
     const isOverdue = now > dueDate;
    if (isOverdue) {
      explanation += "Response is overdue. ";
    } else {
      explanation += "Response pending. ";
    }
  }
  
  explanation += `Priority: ${ticket.priority}. `;
  explanation += hasFirstResponse 
    ? "First response recorded. " 
    : "No first response yet.";
  
  return {
    score: totalScore,
    label,
    color,
    factors: {
      deadlineScore,
      priorityScore,
      responseScore
    },
    explanation: explanation.trim()
  };
}
