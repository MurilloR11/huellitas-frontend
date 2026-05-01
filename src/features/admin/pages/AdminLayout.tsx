import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, ShieldCheck } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '../components/AdminSidebar';

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
          {/* Mobile top bar */}
          <header className="flex items-center gap-3 border-b border-stone-200 bg-white px-4 py-3 md:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
              className="flex items-center justify-center w-8 h-8 rounded-lg text-stone-500 hover:bg-stone-100 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand" />
              <span className="text-sm font-semibold text-stone-900">Panel Admin</span>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
