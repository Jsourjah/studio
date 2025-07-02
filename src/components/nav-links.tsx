"use client";

import { usePathname } from 'next/navigation';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { LayoutDashboard, FileText, Boxes, ShoppingCart, FilePieChart } from 'lucide-react';
import Link from 'next/link';

const navLinks = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/materials', label: 'Items/Services', icon: Boxes },
  { href: '/purchases', label: 'Purchases', icon: ShoppingCart },
  { href: '/reports', label: 'Reports', icon: FilePieChart },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navLinks.map((link) => (
        <SidebarMenuItem key={link.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === link.href}
            className="w-full justify-start"
          >
            <Link href={link.href}>
              <link.icon className="h-5 w-5 mr-3" />
              <span>{link.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
