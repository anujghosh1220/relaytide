import { LayoutDashboard, LifeBuoy, Plus, Ticket } from 'lucide-react';

export interface NavItem {
  name: string;
  href: string;
  icon: typeof Ticket;
  /** Opens the create-ticket form rather than a plain navigation link. */
  cta?: boolean;
}

export const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Tickets', href: '/tickets', icon: LifeBuoy },
  { name: 'Create Ticket', href: '/tickets/new', icon: Plus, cta: true },
];

export const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/tickets': 'Tickets',
  '/tickets/new': 'Create Ticket',
};
