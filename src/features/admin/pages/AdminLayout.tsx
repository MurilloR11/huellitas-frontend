import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminBreadcrumb } from '../components/AdminBreadcrumb';

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-stone-50">
        <AdminSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(c => !c)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Desktop topbar */}
          <header className="hidden md:flex items-center border-b border-stone-200 bg-white px-6 py-3.5">
            <AdminBreadcrumb />
          </header>

          {/* Mobile topbar */}
          <header className="flex items-center gap-3 border-b border-stone-200 bg-white px-4 py-3 md:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
              className="flex items-center justify-center w-8 h-8 rounded-lg text-stone-500 hover:bg-stone-100 transition-colors shrink-0"
            >
              <Menu className="h-5 w-5" />
            </button>
            <AdminBreadcrumb />
          </header>

          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
