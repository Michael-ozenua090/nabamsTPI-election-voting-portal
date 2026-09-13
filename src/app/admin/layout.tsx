import { getAdminSession } from '@/lib/session';
import { AdminSidebar } from './AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  // No session → login page: no sidebar, page owns its own centering.
  if (!session) {
    return (
      <div className="min-h-screen w-full bg-slate-50">
        {children}
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex flex-col md:flex-row">

      {/* AdminSidebar renders:
            • on mobile → sticky top header + slide-out drawer (managed via useState)
            • on desktop → sticky left sidebar (h-screen) */}
      <AdminSidebar email={session.email} />

      {/* Main scrollable content */}
      <main className="flex-1 overflow-y-auto bg-slate-50">
        {children}
      </main>

    </div>
  );
}
