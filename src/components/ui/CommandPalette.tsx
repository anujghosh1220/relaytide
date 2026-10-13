"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, LifeBuoy, LayoutDashboard, Plus, Search } from 'lucide-react';
import type { TicketWithProfile } from '../../lib/types';
import { matchesSearch } from '../../lib/ticketQuery';
import { STATUS_LABELS, PRIORITY_LABELS } from '../../lib/theme';

export interface CommandItem {
  id: string;
  name: string;
  icon?: ReactNode;
  hint?: string;
  onSelect: () => void;
  centered?: boolean;
  active?: boolean;
}

export interface CommandSection {
  label: string;
  grid?: boolean;
  items: CommandItem[];
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  tickets: TicketWithProfile[];
  isApplePlatform?: boolean;
}

const KEYFRAMES = `
@keyframes cm-fly-in {
  from { opacity: 0; transform: translateY(8px); filter: blur(2px); }
}`;

export const CommandPalette = ({
  open,
  onClose,
  tickets,
  isApplePlatform: isAppleOverride,
}: CommandPaletteProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const [highlight, setHighlight] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [highlightMoves, setHighlightMoves] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const navigateRef = useRef(navigate);
  const onCloseRef = useRef(onClose);
  navigateRef.current = navigate;
  onCloseRef.current = onClose;

  const isApple = useMemo(
    () => isAppleOverride ?? /Mac|iPhone|iPad|iPod/.test(navigator.userAgent),
    [isAppleOverride]
  );

  const go = (path: string) => {
    onCloseRef.current();
    navigateRef.current(path);
  };

  const sections = useMemo<CommandSection[]>(() => {
    const commands: CommandSection[] = [
      {
        label: 'Navigate',
        items: [
          { id: 'nav-dashboard', name: 'Dashboard', icon: <LayoutDashboard className="size-4" />, onSelect: () => go('/') },
          { id: 'nav-tickets', name: 'Tickets', icon: <LifeBuoy className="size-4" />, onSelect: () => go('/tickets') },
          {
            id: 'nav-new-ticket',
            name: 'Create Ticket',
            icon: <Plus className="size-4" />,
            hint: 'New',
            onSelect: () => go('/tickets/new'),
          },
        ],
      },
    ];

    const needle = query.trim().toLowerCase();
    if (!needle) return commands;

    const matches = tickets.filter((ticket) => matchesSearch(ticket, needle));
    if (matches.length > 0) {
      commands.push({
        label: 'Tickets',
        items: matches.slice(0, 6).map((ticket) => ({
          id: `ticket-${ticket.id}`,
          name: ticket.title,
          icon: <LifeBuoy className="size-4" />,
          hint: `${STATUS_LABELS[ticket.status]} · ${PRIORITY_LABELS[ticket.priority]}`,
          onSelect: () => go(`/tickets/${ticket.id}`),
        })),
      });
    }

    return commands;
  }, [query, tickets]);

  const allItems = sections.flatMap((section) => section.items);

  const itemsRef = useRef(allItems);
  itemsRef.current = allItems;
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  // Sync selection when query changes
  useEffect(() => {
    if (open) setSelected(0);
  }, [query, open]);

  // Highlight position calculation
  useLayoutEffect(() => {
    if (!open || selected < 0) {
      setHighlightMoves(false);
      return;
    }
    const element = itemRefs.current[selected];
    if (!element) return;
    setHighlight((previous) => {
      setHighlightMoves(previous !== null);
      return {
        top: element.offsetTop,
        left: element.offsetLeft,
        width: element.offsetWidth,
        height: element.offsetHeight,
      };
    });
  }, [open, selected, allItems.length]);

  // Focus input on open
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    setQuery('');
    setSelected(0);
    const raf = requestAnimationFrame(() => inputRef.current?.focus());

    return () => {
      cancelAnimationFrame(raf);
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      const count = itemsRef.current.length;
      const move = (delta: number) => setSelected((value) => (value + delta + count) % count);

      switch (event.key) {
        case 'ArrowUp':
        case 'k':
          event.preventDefault();
          move(-1);
          break;
        case 'ArrowDown':
        case 'j':
          event.preventDefault();
          move(1);
          break;
        case 'Enter':
          event.preventDefault();
          itemsRef.current[selectedRef.current]?.onSelect();
          break;
        case 'Escape':
          event.preventDefault();
          onCloseRef.current();
          break;
      }
    }

    function onClick(event: MouseEvent) {
      if (!(event.target as HTMLElement).closest('[data-command-menu]')) onCloseRef.current();
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('click', onClick);
    };
  }, [open, allItems.length]);

  if (!open) return null;

  const shortcutLabel = isApple ? '⌘K' : 'Ctrl K';

  return (
    <div
      data-command-menu
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]"
    >
      <button
        type="button"
        aria-label="Close command palette"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/70 backdrop-blur-sm"
      />

      <div
        ref={listRef}
        className={`relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl shadow-black/50 transition-all duration-400 ease-out ${
          open ? 'max-h-[min(24rem,60vh)] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <style>{KEYFRAMES}</style>

        <div className="flex items-center gap-2.5 border-b border-border px-4">
          <Search className="size-4 shrink-0 text-subtle-foreground" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tickets or jump to a page"
            aria-label="Search tickets or jump to a page"
            className="h-12 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-subtle-foreground"
          />
          <kbd className="hidden shrink-0 rounded-md border border-border bg-background px-1.5 py-0.5 font-sans text-[11px] text-subtle-foreground sm:block">
            {shortcutLabel}
          </kbd>
        </div>

        <div className="max-h-[min(24rem,60vh)] overflow-y-auto p-2">
          {allItems.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              No tickets match &ldquo;{query.trim()}&rdquo;.
            </p>
          ) : (
            sections.map((section) => (
              <div key={section.label} className="mb-1 last:mb-0">
                <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">
                  {section.label}
                </p>
                <div className="relative">
                  {highlight && (
                    <span
                      aria-hidden="true"
                      style={{
                        transform: `translate3d(${highlight.left}px, ${highlight.top}px, 0)`,
                        width: highlight.width,
                        height: highlight.height,
                      }}
                      className={`pointer-events-none absolute left-0 top-0 rounded-lg bg-primary/10 ring-1 ring-inset ring-primary/20 ${
                        highlightMoves
                          ? 'transition-[transform,width,height] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]'
                          : 'transition-opacity duration-150'
                      }`}
                    />
                  )}
                  {section.items.map((item) => {
                    const index = allItems.findIndex((candidate) => candidate.id === item.id);
                    const active = index === selected;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        ref={(node) => {
                          itemRefs.current[index] = node;
                        }}
                        onMouseEnter={() => setSelected(index)}
                        onClick={item.onSelect}
                        className={`relative z-10 flex w-full cursor-pointer items-center gap-3 rounded-lg p-2 text-left text-sm ${
                          active ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        <span className={active ? 'text-primary' : 'text-subtle-foreground'}>
                          {item.icon}
                        </span>
                        <span className="min-w-0 flex-1 truncate">{item.name}</span>
                        {item.hint && (
                          <span className="shrink-0 text-[11px] text-subtle-foreground">
                            {item.hint}
                          </span>
                        )}
                        <ArrowRight
                          className={`size-3.5 shrink-0 transition-opacity ${
                            active ? 'text-primary opacity-100' : 'opacity-0'
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[11px] text-subtle-foreground">
          <span>↑↓ to navigate · ⏎ to open</span>
          <span>esc to close</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;