import { Link, useLocation } from "react-router-dom";
import { LogOut, Waves, X } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Separator } from "../ui/Separator";
import { navigation } from "./navigation";

interface AppSidebarProps {
  /** Desktop rail mode: icons only. */
  collapsed: boolean;
  /** Mobile drawer visibility. */
  mobileOpen: boolean;
  onCloseMobile: () => void;
  user: User | null;
  onSignOut: () => void;
}

const itemBase =
  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors";

export const AppSidebar = ({
  collapsed,
  mobileOpen,
  onCloseMobile,
  user,
  onSignOut,
}: AppSidebarProps) => {
  const location = useLocation();
  const displayName =
    (user?.user_metadata?.display_name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "RelayTide user";

  const navLinks = (options: { compact: boolean }) => (
    <>
      {navigation.map((item) => {
        const active =
          item.href === "/"
            ? location.pathname === "/"
            : location.pathname === item.href ||
              location.pathname.startsWith(`${item.href}/`);

        if (item.cta) {
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onCloseMobile}
              title={options.compact ? item.name : undefined}
              className="mt-2 flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent-hover"
            >
              <item.icon className="size-4 shrink-0" aria-hidden="true" />
              <span className={options.compact ? "lg:hidden" : undefined}>
                {item.name}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={onCloseMobile}
            title={options.compact ? item.name : undefined}
            aria-current={active ? "page" : undefined}
            className={`${itemBase} ${
              active
                ? "bg-primary/10 text-primary ring-1 ring-inset ring-primary/20"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <item.icon
              className={`size-4.5 shrink-0 ${
                active ? "text-primary" : "text-subtle-foreground group-hover:text-foreground"
              }`}
              aria-hidden="true"
            />
            <span className={options.compact ? "lg:hidden" : undefined}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </>
  );

  const brand = (compact: boolean) => (
    <div className="flex h-16 items-center gap-2.5 border-b border-border px-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-inset ring-primary/25">
        <Waves className="size-5" aria-hidden="true" />
      </span>
      {!compact && (
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-foreground">
            RelayTide
          </span>
          <span className="block truncate text-[11px] text-subtle-foreground">
            Incident response
          </span>
        </span>
      )}
    </div>
  );

  const account = (compact: boolean) => (
    <div className="border-t border-border p-3">
      <div className={`flex items-center gap-3 ${compact ? "lg:justify-center" : ""}`}>
        <Avatar name={displayName} className="size-9" />
        {!compact && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {displayName}
            </p>
            <p className="truncate text-xs text-subtle-foreground">{user?.email}</p>
          </div>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onSignOut}
        className={`mt-2 w-full ${compact ? "lg:w-full lg:px-0" : ""}`}
      >
        <LogOut className="size-4" aria-hidden="true" />
        <span className={compact ? "lg:hidden" : undefined}>Sign out</span>
      </Button>
    </div>
  );

  return (
    <>
      {/* Desktop rail */}
      <aside
        data-collapsed={collapsed}
        className={`fixed inset-y-0 left-0 z-30 hidden shrink-0 border-r border-border bg-surface transition-[width] duration-200 ease-out lg:block ${
          collapsed ? "w-[4.5rem]" : "w-64"
        }`}
      >
        <div className="flex h-full flex-col">
          {brand(collapsed)}
          <nav aria-label="Main" className="flex-1 space-y-1 overflow-y-auto p-3">
            {navLinks({ compact: collapsed })}
          </nav>
          <Separator />
          {account(collapsed)}
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onCloseMobile}
            className="absolute inset-0 h-full w-full cursor-default bg-black/60 backdrop-blur-sm"
          />
          <aside
            aria-label="Main navigation"
            className="relative flex h-full w-72 max-w-[82vw] flex-col border-r border-border bg-surface shadow-2xl"
          >
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <span className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-inset ring-primary/25">
                  <Waves className="size-5" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-foreground">RelayTide</span>
              </span>
              <Button variant="ghost" size="sm" onClick={onCloseMobile} aria-label="Close navigation">
                <X className="size-4" />
              </Button>
            </div>
            <nav aria-label="Main" className="flex-1 space-y-1 overflow-y-auto p-3">
              {navLinks({ compact: false })}
            </nav>
            <Separator />
            {account(false)}
          </aside>
        </div>
      )}
    </>
  );
};

export default AppSidebar;