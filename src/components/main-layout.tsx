import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { NavLinks } from '@/components/nav-links';
import Image from 'next/image';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2" data-testid="sidebar-header">
            <Image
              src="https://placehold.co/32x32.png"
              width={32}
              height={32}
              alt="Business Manager Logo"
              data-ai-hint="abstract geometric"
              className="rounded-lg"
            />
            <h1 className="text-lg font-semibold text-sidebar-foreground">
              OBM
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <NavLinks />
        </SidebarContent>
        <SidebarFooter>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1" />
          {/* Header content can go here */}
        </header>
        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
