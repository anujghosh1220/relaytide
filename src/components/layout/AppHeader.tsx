import { PanelLeft, Search } from "lucide-react";
import { Button } from "../ui/Button";
import { useIsApplePlatform } from "../../hooks/useMediaQuery";
import { useState, useEffect } from 'react';

interface AppHeaderProps {
  title: string;
  description?: string;
  /** Opens the mobile drawer on small screens, collapses the desktop rail at `lg+`. */
  onToggleNavigation: () => void;
  onOpenPalette: () => void;
  compactNavigation: boolean;
}

export const AppHeader = ({
  title,
  description,
  onToggleNavigation,
  onOpenPalette,
  compactNavigation,
}: AppHeaderProps) => {
  const isApple = useIsApplePlatform();
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    // Check if demo mode is enabled on mount
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const isDemoInUrl = urlParams.get('demo') === 'true';
      const isDemoInStorage = localStorage.getItem('relaytide.demoMode') === 'true';
      setDemoMode(isDemoInUrl || isDemoInStorage);
    }
  }, []);

  const toggleDemoMode = () => {
    const newMode = !demoMode;
    setDemoMode(newMode);
    if (newMode) {
      localStorage.setItem('relaytide.demoMode', 'true');
      // Update URL without reloading
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set('demo', 'true');
      const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
      window.history.replaceState({}, '', newUrl);
    } else {
      localStorage.removeItem('relaytide.demoMode');
      // Update URL without reloading
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.delete('demo');
      const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
      window.history.replaceState({}, '', newUrl);
    }
    // Reload the app to apply demo mode
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:px-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleNavigation}
        aria-label={compactNavigation ? "Expand navigation" : "Collapse navigation"}
        className="shrink-0 px-2"
      >
        <PanelLeft
          className={`size-4.5 transition-transform duration-200 ${
            compactNavigation ? "" : "rotate-180"
          }`}
          aria-hidden="true"
        />
      </Button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">
          {title}
        </h1>
        {description && (
          <p className="hidden truncate text-xs text-muted-foreground sm:block">
            {description}
          </p>
        )}
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={onOpenPalette}
        className="hidden shrink-0 gap-2 text-muted-foreground md:inline-flex"
        aria-keyshortcuts={isApple ? "Meta+K" : "Control+K"}
      >
        <Search className="size-4" aria-hidden="true" />
        <span>Search tickets</span>
        <kbd className="ml-1 rounded border border-border bg-background px-1.5 py-0.5 font-sans text-[11px] text-subtle-foreground">
          {isApple ? "⌘K" : "Ctrl K"}
        </kbd>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onOpenPalette}
        aria-label="Search tickets"
        className="shrink-0 px-2 md:hidden"
      >
        <Search className="size-4.5" />
      </Button>

      {/* Demo Mode Toggle */}
      <Button
        variant={demoMode ? "outline" : "secondary"}
        size="sm"
        onClick={toggleDemoMode}
        className="shrink-0 px-2 ml-2"
        title={demoMode ? "Disable Demo Mode" : "Enable Demo Mode"}
      >
        {demoMode ? (
          <>
            <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 16 14.62 18.18 21.01 12 17.77 5.82 21.01 8 14.62 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span className="ml-1">Demo: ON</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 16 14.62 18.18 21.01 12 17.77 5.82 21.01 8 14.62 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span className="ml-1">Demo: OFF</span>
          </>
        )}
      </Button>
    </header>
  );
};

export default AppHeader;