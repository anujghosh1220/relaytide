import { PanelLeft, Search } from "lucide-react";
import { Button } from "../ui/Button";
import { useIsApplePlatform } from "../../hooks/useMediaQuery";

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
    </header>
  );
};

export default AppHeader;