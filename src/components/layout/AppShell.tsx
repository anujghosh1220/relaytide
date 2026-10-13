import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { CommandPalette } from '../ui/CommandPalette';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useCommandShortcut } from '../../hooks/useCommandShortcut';
import { useTicketSearch } from '../../hooks/useTickets';

const COLLAPSE_STORAGE_KEY = 'relaytide.sidebar.collapsed';

interface AppShellProps {
  title: string;
  description?: string;
  user: User | null;
  onSignOut: () => void;
  children: ReactNode;
}

/**
 * Dashboard shell adapted from the 21st.dev `app-1` component: a provider-driven
 * sidebar with a sticky inset header, matching its `min-w-0` fix so the inset can
 * shrink below its widest child at tablet widths.
 */
export const AppShell = ({ title, description, user, onSignOut, children }: AppShellProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage?.getItem(COLLAPSE_STORAGE_KEY) === 'true';
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    window.localStorage?.setItem(COLLAPSE_STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const toggleNavigation = useCallback(() => {
    if (isDesktop) {
      setCollapsed((value) => !value);
    } else {
      setMobileOpen((value) => !value);
    }
  }, [isDesktop]);

  const handleSignOut = useCallback(async () => {
    await onSignOut();
    navigate('/login');
  }, [onSignOut, navigate]);

  const togglePalette = useCallback(() => setPaletteOpen((value) => !value), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  useCommandShortcut('k', togglePalette);

  const { tickets } = useTicketSearch(paletteOpen);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        user={user}
        onSignOut={handleSignOut}
      />

      <div
        className={`flex min-h-screen min-w-0 flex-1 flex-col transition-[padding] duration-200 ease-out ${
          collapsed ? 'lg:pl-[4.5rem]' : 'lg:pl-64'
        }`}
      >
        <AppHeader
          title={title}
          description={description}
          onToggleNavigation={toggleNavigation}
          onOpenPalette={() => setPaletteOpen(true)}
          compactNavigation={collapsed}
        />

        <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6">{children}</main>
      </div>

      <CommandPalette open={paletteOpen} onClose={closePalette} tickets={tickets} />
    </div>
  );
};

export default AppShell;
