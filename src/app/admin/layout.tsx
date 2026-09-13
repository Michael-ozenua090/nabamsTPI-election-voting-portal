import { getAdminSession } from '@/lib/session';
import { AdminSidebar } from './AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  // No session → login page: render without sidebar, page owns its own centering.
  if (!session) {
    return (
      <div className="min-h-screen w-full bg-slate-50">
        {children}
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex flex-col">
      {/* Mobile sticky top bar (md:hidden, lives inside AdminSidebar fragment) */}
      <div className="md:hidden sticky top-0 z-30">
        <AdminSidebar email={session.email} />
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Desktop sidebar — sticky inside AdminSidebar */}
        <div className="hidden md:block">
          <AdminSidebar email={session.email} />
        </div>

        {/* Main scrollable content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
