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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Mobile top bar lives inside AdminSidebar */}
      <div className="md:hidden">
        <AdminSidebar email={session.email} />
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <AdminSidebar email={session.email} />
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto bg-slate-50">
          {children}
        </div>
      </div>
    </div>
  );
}
