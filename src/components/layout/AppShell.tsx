import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { CommandPalette } from '../ui/CommandPalette';
import { Button } from '../ui/Button';
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
  const [helpOpen, setHelpOpen] = useState(false);

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

  const toggleHelp = useCallback(() => setHelpOpen((value) => !value), []);
  const closeHelp = useCallback(() => setHelpOpen(false), []);

  useCommandShortcut('k', togglePalette);
  useCommandShortcut('?', toggleHelp);

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

       {/* Keyboard Shortcuts Help Panel */}
       {helpOpen && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
             <h2 className="text-xl font-semibold text-gray-900 mb-6">Keyboard Shortcuts</h2>
             <div className="space-y-4">
               <div className="flex items-start gap-4">
                 <div className="flex-shrink-0">
                   <div className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-500 text-white text-sm">
                     ?
                   </div>
                 </div>
                 <div>
                   <h3 className="font-medium text-gray-900">Toggle Help Panel</h3>
                   <p className="text-sm text-gray-600">Show/hide this help panel</p>
                 </div>
               </div>
               <div className="flex items-start gap-4">
                 <div className="flex-shrink-0">
                   <div className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-500 text-white text-sm">
                     ⌘K
                   </div>
                 </div>
                 <div>
                   <h3 className="font-medium text-gray-900">Open Command Palette</h3>
                   <p className="text-sm text-gray-600">Search tickets quickly</p>
                 </div>
               </div>
               <div className="flex items-start gap-4">
                 <div className="flex-shrink-0">
                   <div className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-500 text-white text-sm">
                     Esc
                   </div>
                 </div>
                 <div>
                   <h3 className="font-medium text-gray-900">Close Open Panels</h3>
                   <p className="text-sm text-gray-600">Close command palette, help panel, or modals</p>
                 </div>
               </div>
               <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-500 text-white text-sm">
                      ?
                    </div>
                  </div>
                 <div>
                   <h3 className="font-medium text-gray-900">Toggle Help Panel</h3>
                   <p className="text-sm text-gray-600">Show/hide this help panel (alternative)</p>
                 </div>
               </div>
             </div>
             <div className="mt-6 flex justify-end">
               <Button variant="secondary" onClick={closeHelp}>
                 Got it
               </Button>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 };

export default AppShell;
