"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import { Search, X, Check, UserPlus, Download, Trash2, MoreHorizontal, Star } from "lucide-react";
import type { TicketWithProfile, TicketStatus, TicketPriority } from "../../lib/types";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { formatRelativeTime, isOverdue, calculateSLAStatus, getHumanReadableTicketId, getSavedViews, saveView, deleteView, type SavedView, calculateHealthScore } from "../../lib/utils";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Skeleton } from "../ui/Skeleton";
import { STATUS_LABELS, PRIORITY_LABELS } from "../../lib/theme";
import { useTickets } from "../../hooks/useTickets";

export interface TicketTableProps {
  tickets: TicketWithProfile[];
  loading: boolean;
  onCreateTicket?: () => void;
}

const STATUS_OPTIONS: { value: TicketStatus | "all"; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const PRIORITY_OPTIONS: { value: TicketPriority | "all"; label: string }[] = [
  { value: "all", label: "All Priorities" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "created_at", label: "Created Date" },
  { value: "response_due_at", label: "Response Due" },
  { value: "priority", label: "Priority" },
  { value: "title", label: "Title" },
  { value: "status", label: "Status" },
];

interface SortState {
  key: string;
  direction: "asc" | "desc";
}

const rowVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.98,
    filter: "blur(4px)" 
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
      mass: 0.7,
    },
  },
};

const containerVariants: Variants = {
  visible: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.1,
    }
  }
};

export const TicketsTable = ({ tickets, loading, onCreateTicket }: TicketTableProps) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "all">("all");
  const [sort, setSort] = useState<SortState>({ key: "created_at", direction: "desc" });
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
   const [savedViewId, setSavedViewId] = useState<string | undefined>(undefined);
  const [saveViewName, setSaveViewName] = useState("");
  const [showSaveViewModal, setShowSaveViewModal] = useState(false);
  const [deletingViewId, setDeletingViewId] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const { updateTicket, deleteTicket } = useTickets();

  useEffect(() => {
    setSavedViews(getSavedViews());
  }, []);

   const handleSavedViewChange = useCallback((viewId: string | null) => {
     setSavedViewId(viewId ?? undefined);
     if (viewId) {
       const view = savedViews.find(v => v.id === viewId);
      if (view) {
        setSearch(view.search);
        setStatusFilter(view.statusFilter);
        setPriorityFilter(view.priorityFilter);
        setSort({ key: view.sortKey, direction: view.sortDirection });
      }
    } else {
      // Reset to default when "All Views" is selected
      setSearch("");
      setStatusFilter("all");
      setPriorityFilter("all");
      setSort({ key: "created_at", direction: "desc" });
    }
  }, [savedViews]);

  const handleSaveView = useCallback(() => {
    if (saveViewName.trim() === "") return;
    
    saveView({
      name: saveViewName.trim(),
      search,
      statusFilter,
      priorityFilter,
      sortKey: sort.key,
      sortDirection: sort.direction
    });
    
    setSavedViews(getSavedViews()); // Refresh the list
    setSaveViewName("");
    setShowSaveViewModal(false);
  }, [saveViewName, sort, statusFilter, priorityFilter, search]);

  const handleDeleteView = useCallback((viewId: string) => {
    deleteView(viewId);
    setSavedViews(getSavedViews()); // Refresh the list
     if (savedViewId === viewId) {
       setSavedViewId(undefined);
       // Reset filters when current view is deleted
       setSearch("");
       setStatusFilter("all");
      setPriorityFilter("all");
      setSort({ key: "created_at", direction: "desc" });
    }
  }, [savedViewId]);

  const filteredTickets = useMemo(() => {
    let result = tickets.filter((ticket) => {
      const matchesSearch =
        ticket.title.toLowerCase().includes(search.toLowerCase()) ||
        ticket.description.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });

    result = [...result].sort((a, b) => {
      const factor = sort.direction === "asc" ? 1 : -1;

      switch (sort.key) {
        case "priority": {
          const priorityRank: Record<TicketPriority, number> = {
            low: 0,
            medium: 1,
            high: 2,
            critical: 3,
          };
          return (priorityRank[a.priority] - priorityRank[b.priority]) * factor;
        }
        case "status": {
          const statusRank: Record<TicketStatus, number> = {
            open: 0,
            in_progress: 1,
            resolved: 2,
            closed: 3,
          };
          return (statusRank[a.status] - statusRank[b.status]) * factor;
        }
        case "title":
          return a.title.localeCompare(b.title) * factor;
        case "response_due_at": {
          if (!a.response_due_at && !b.response_due_at) return 0;
          if (!a.response_due_at) return 1 * factor;
          if (!b.response_due_at) return -1 * factor;
          return (new Date(a.response_due_at).getTime() - new Date(b.response_due_at).getTime()) * factor;
        }
        case "created_at":
        default:
          return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * factor;
      }
    });

    return result;
  }, [tickets, search, statusFilter, priorityFilter, sort]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTickets(new Set(filteredTickets.map((t) => t.id)));
    } else {
      setSelectedTickets(new Set());
    }
  };

  const handleSelectTicket = (id: string, checked: boolean) => {
    setSelectedTickets((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const isAllSelected = selectedTickets.size === filteredTickets.length && filteredTickets.length > 0;

  const handleSort = (key: string) => {
    setSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPriorityFilter("all");
  };



  const hasActiveFilters = search || statusFilter !== "all" || priorityFilter !== "all";

  // Bulk action handlers
  const handleBulkStatusUpdate = useCallback(async (newStatus: TicketStatus) => {
    for (const id of selectedTickets) {
      await updateTicket(id, { status: newStatus });
    }
    setSelectedTickets(new Set());
  }, [selectedTickets, updateTicket]);

  const handleBulkAssign = useCallback(async () => {
    // In a real app, this would open a dialog to select an assignee
    console.log("Bulk assign:", Array.from(selectedTickets));
  }, [selectedTickets]);

  const handleBulkExport = useCallback(() => {
    const selected = filteredTickets.filter((t) => selectedTickets.has(t.id));
    const csv = [
      ["Title", "Status", "Priority", "Assignee", "Created", "Response Due"],
      ...selected.map((t) => [
        t.title,
        STATUS_LABELS[t.status],
        PRIORITY_LABELS[t.priority],
        t.assigned_to_profile?.display_name || "Unassigned",
        formatRelativeTime(t.created_at),
        t.response_due_at ? formatRelativeTime(t.response_due_at) : "—",
      ]),
    ].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `tickets-export-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    setSelectedTickets(new Set());
  }, [filteredTickets, selectedTickets]);

  const handleBulkDelete = useCallback(async () => {
    if (!confirm(`Delete ${selectedTickets.size} ticket(s)? This cannot be undone.`)) return;
    for (const id of selectedTickets) {
      await deleteTicket(id);
    }
    setSelectedTickets(new Set());
  }, [selectedTickets, deleteTicket]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <span className="text-3xl">📭</span>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No tickets yet</h3>
          <p className="text-muted-foreground mb-4">Create your first ticket to get started</p>
          {onCreateTicket && (
            <Button onClick={onCreateTicket}>Create Ticket</Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (filteredTickets.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <span className="text-3xl">🔍</span>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No tickets found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CardTitle>All Tickets</CardTitle>
        <div className="flex items-center gap-2">
          {onCreateTicket && (
            <Button onClick={onCreateTicket}>
              <svg className="size-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create Ticket
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
<div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
             <Input
               placeholder="Search tickets..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="pl-9"
             />
           </div>

           <div className="relative">
             <label className="text-xs text-muted-foreground mb-1 block">View</label>
             <div className="flex items-center gap-2">
               <select
                 value={savedViewId}
                 onChange={(e) => handleSavedViewChange(e.target.value)}
                 className="flex h-10 w-full max-w-xs items-center rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
               >
                 <option value="">All Views</option>
                 {savedViews.map((view) => (
                   <option key={view.id} value={view.id}>
                     {view.name}
                   </option>
                 ))}
               </select>
               {savedViewId && (
                 <button
                   onClick={() => setDeletingViewId(savedViewId)}
                   className="text-red-500 hover:text-red-700 h-10 w-10 flex items-center justify-center rounded-lg hover:bg-red-50"
                   title="Delete view"
                 >
                   <X className="size-4" />
                 </button>
               )}
             </div>
           </div>

           <select
             value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TicketStatus | "all")}
            className="flex h-10 w-full max-w-xs items-center rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TicketPriority | "all")}
            className="flex h-10 w-full max-w-xs items-center rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={sort.key}
            onChange={(e) => handleSort(e.target.value)}
            className="flex h-10 w-full max-w-xs items-center rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label} ({sort.key === opt.value ? (sort.direction === "asc" ? "↑" : "↓") : ""})
              </option>
            ))}
          </select>

{hasActiveFilters && (
             <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
               <X className="size-3.5" />
               Clear
             </Button>
           )}
           <Button variant="ghost" size="sm" onClick={() => setShowSaveViewModal(true)} className="gap-1 ml-2 disabled:opacity-50" disabled={!hasActiveFilters && search === "" && statusFilter === "all" && priorityFilter === "all"}>
             <Star className="size-3.5 mr-1" />
             Save View
           </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full" role="grid">
<thead>
                <tr className="border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3 text-left w-12">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded border-border-strong text-primary focus:ring-primary/20 focus:ring-2 accent-primary bg-background"
                      aria-label="Select all tickets"
                    />
                  </th>
                  <th className="px-4 py-3 text-left">Ticket</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Status</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Priority</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Assignee</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Created</th>
                  <th className="px-4 py-3 text-left hidden xl:table-cell">Response Due</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">SLA</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Health</th>
                  <th className="px-4 py-3 text-right w-12">Actions</th>
                </tr>
            </thead>
            <motion.tbody
              variants={shouldReduceMotion ? undefined : containerVariants}
              initial={shouldReduceMotion ? undefined : "hidden"}
              animate={shouldReduceMotion ? undefined : "visible"}
            >
                {filteredTickets.map((ticket, index) => (
                  <motion.tr
                    key={ticket.id}
                    variants={shouldReduceMotion ? undefined : rowVariants}
                    className={`transition-colors ${
                      selectedTickets.has(ticket.id)
                        ? "bg-primary/5"
                        : "hover:bg-muted/30"
                    } ${index < filteredTickets.length - 1 ? "border-b border-border/20" : ""}`}
                    onMouseEnter={() => setHoveredRow(ticket.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
<td className="px-4 py-3">
                       <input
                         type="checkbox"
                         checked={selectedTickets.has(ticket.id)}
                         onChange={(e) => handleSelectTicket(ticket.id, e.target.checked)}
                         className="w-4 h-4 rounded border-border-strong text-primary focus:ring-primary/20 focus:ring-2 accent-primary bg-background"
                       />
                     </td>
                     <td className="px-4 py-3">
                       <Link
                         to={`/tickets/${ticket.id}`}
                         className="font-medium text-foreground hover:text-primary truncate block max-w-xs"
                       >
                         {ticket.title}
                       </Link>
                       <div className="flex items-center gap-1 mt-1">
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 text-xs font-medium">
                            Ticket #{getHumanReadableTicketId(ticket.id)}
                          </div>
                           <button
                             onClick={async () => {
                               await navigator.clipboard.writeText(getHumanReadableTicketId(ticket.id));
                               // Show temporary feedback
                             }}
                             className="text-blue-600 hover:text-blue-800 text-xs"
                             title="Copy ticket ID"
                           >
                            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                          </button>
                       </div>
                       <p className="text-sm text-muted-foreground truncate max-w-xs mt-0.5">
                         {ticket.description}
                       </p>
                     </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge type="status" value={ticket.status} />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge type="priority" value={ticket.priority} />
                    </td>
<td className="px-4 py-3 hidden lg:table-cell">
                       {ticket.assigned_to_profile ? (
                         <span className="text-sm text-foreground">{ticket.assigned_to_profile.display_name}</span>
                       ) : (
                         <span className="text-sm text-muted-foreground">Unassigned</span>
                       )}
                     </td>
                     <td className="px-4 py-3 hidden lg:table-cell text-sm text-muted-foreground">
                       {formatRelativeTime(ticket.created_at)}
                     </td>
                     <td className="px-4 py-3 hidden xl:table-cell">
                       {ticket.response_due_at ? (
                         <>
                           {isOverdue(ticket) && !ticket.first_response_at && (
                             <span className="text-sm font-medium text-priority-critical">Overdue</span>
                           )}
                           {!isOverdue(ticket) || ticket.first_response_at ? (
                             <span className="text-sm text-muted-foreground">
                               {formatRelativeTime(ticket.response_due_at)}
                             </span>
                           ) : null}
                         </>
                       ) : (
                         <span className="text-sm text-muted-foreground">—</span>
                       )}
                     </td>
<td className="px-4 py-3 hidden lg:table-cell">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          calculateSLAStatus(ticket).status === 'plenty' 
                            ? 'bg-blue-100 text-blue-800'
                            : calculateSLAStatus(ticket).status === 'approaching'
                              ? 'bg-amber-100 text-amber-800'
                              : calculateSLAStatus(ticket).status === 'overdue'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                        }`}>
                          {calculateSLAStatus(ticket).formattedTime}
                        </span>
                      </td>
                       <td className="px-4 py-3 hidden lg:table-cell">
                         <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                           calculateHealthScore(ticket).color
                         }`}>
                           {calculateHealthScore(ticket).label}
                         </span>
                       </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {hoveredRow === ticket.id && (
                          <motion.button
                            initial={{ opacity: 0, x: -10, filter: "blur(4px)" }}
                            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, x: -10, filter: "blur(4px)" }}
                            transition={{ 
                              type: "spring", 
                              stiffness: 500, 
                              damping: 30,
                            }}
                            onClick={() => handleBulkStatusUpdate("in_progress")}
                            className="flex items-center gap-2 px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg text-xs font-medium shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                          >
                            Engage
                            <div className="w-px h-3 bg-primary/30 mx-1" />
                            <MoreHorizontal className="w-3 h-3" />
                          </motion.button>
                        )}
                        <Link
                          to={`/tickets/${ticket.id}`}
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          aria-label={`View ticket ${ticket.title}`}
                        >
                          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </Link>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
          </table>
        </div>

{/* Bottom Action Bar */}
        <AnimatePresence>
        {selectedTickets.size > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0, filter: "blur(8px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: 100, opacity: 0, filter: "blur(8px)" }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 30,
              mass: 0.8 
            }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-surface/95 backdrop-blur-lg border border-border rounded-xl px-4 py-3 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span className="text-xs font-medium text-foreground">
                  {selectedTickets.size} ticket{selectedTickets.size !== 1 ? "s" : ""} selected
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => handleBulkStatusUpdate("in_progress")}>
                    <Check className="size-3.5 mr-1.5" />
                    Mark In Progress
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleBulkAssign}>
                    <UserPlus className="size-3.5 mr-1.5" />
                    Assign
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleBulkExport}>
                    <Download className="size-3.5 mr-1.5" />
                    Export CSV
                  </Button>
                  <Button variant="danger" size="sm" onClick={handleBulkDelete}>
                    <Trash2 className="size-3.5 mr-1.5" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Save View Modal */}
      {showSaveViewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Save Current View</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">View Name</label>
              <input
                type="text"
                value={saveViewName}
                onChange={(e) => setSaveViewName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                placeholder="Enter a name for this view"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowSaveViewModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveView}>
                Save View
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete View Confirmation */}
      {deletingViewId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete View</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this view? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setDeletingViewId(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => {
                handleDeleteView(deletingViewId);
                setDeletingViewId(null);
              }}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
  );
};

export default TicketsTable;