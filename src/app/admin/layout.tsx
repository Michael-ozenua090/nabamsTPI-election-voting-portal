import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAdminSession } from '@/lib/session';
import { logoutAdmin } from '@/app/actions/admin';
import { LayoutDashboard, BarChart3, PlusCircle, Users, Settings, LogOut, SlidersHorizontal } from 'lucide-react';
import Image from 'next/image';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/results', label: 'Live Results', icon: BarChart3 },
  { href: '/admin/candidates', label: 'Candidates', icon: PlusCircle },
  { href: '/admin/voters', label: 'Voter Roll', icon: Users },
  { href: '/admin/adjustments', label: 'Adjustments', icon: SlidersHorizontal },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  // If no session (e.g. on /admin/login), just render the page without the sidebar.
  // Middleware handles actual route protection.
  if (!session) {
    return <div className="min-h-screen bg-slate-50 flex">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 flex-col bg-[#0B2341] shadow-xl">
        {/* Sidebar header */}
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-3 mb-3">
            <Image src="/nabams-logo.png" alt="NABAMS" width={36} height={36} className="h-9 w-auto object-contain flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-sky-300 leading-tight">NABAMS TPI</p>
              <p className="text-sm font-semibold text-white leading-tight">Electoral Admin</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 truncate">{session.email}</p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-sky-600 hover:text-white transition duration-150"
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-white/10 p-3">
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-red-600/20 hover:text-red-300 transition duration-150"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile top bar */}
        <div className="flex items-center gap-3 border-b border-slate-200 bg-[#0B2341] px-4 py-3 md:hidden shadow-sm">
          <p className="font-bold text-sky-300 text-sm">NABAMS Admin</p>
          <div className="ml-auto flex gap-1">
            {NAV.map(({ href, icon: Icon }) => (
              <Link key={href} href={href} className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-sky-600 transition-colors">
                <Icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-slate-50">{children}</div>
      </div>
    </div>
  );
}
