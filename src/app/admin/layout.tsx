import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAdminSession } from '@/lib/session';
import { logoutAdmin } from '@/app/actions/admin';
import { LayoutDashboard, BarChart3, PlusCircle, Users, Settings, LogOut, SlidersHorizontal } from 'lucide-react';

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
  if (!session) redirect('/admin/login');
  return (
    <div className="min-h-screen bg-nabams-dark flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-60 flex-col border-r border-white/10 bg-white/3">
        <div className="border-b border-white/10 px-5 py-5">
          <p className="text-xs font-bold uppercase tracking-widest text-nabams-gold">NABAMS TPI</p>
          <p className="mt-0.5 text-sm font-semibold text-white">Electoral Admin</p>
          <p className="mt-1 text-xs text-gray-500 truncate">{session.email}</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-white/8 hover:text-white transition-colors">
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3">
          <form action={logoutAdmin}>
            <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-red-900/20 hover:text-red-300 transition-colors">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </form>
        </div>
      </aside>
      {/* Mobile top bar */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-3 border-b border-white/10 bg-white/3 px-4 py-3 md:hidden">
          <p className="font-bold text-nabams-gold text-sm">NABAMS Admin</p>
          <div className="ml-auto flex gap-2">
            {NAV.map(({ href, icon: Icon }) => (
              <Link key={href} href={href} className="rounded-lg p-2 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"><Icon className="h-4 w-4" /></Link>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
