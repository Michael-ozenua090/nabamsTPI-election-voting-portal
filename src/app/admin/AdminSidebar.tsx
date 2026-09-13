'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { logoutAdmin } from '@/app/actions/admin';
import {
  LayoutDashboard,
  BarChart3,
  PlusCircle,
  Users,
  Settings,
  LogOut,
  SlidersHorizontal,
} from 'lucide-react';
import Image from 'next/image';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/results', label: 'Live Results', icon: BarChart3, exact: false },
  { href: '/admin/candidates', label: 'Candidates', icon: PlusCircle, exact: false },
  { href: '/admin/voters', label: 'Voter Roll', icon: Users, exact: false },
  { href: '/admin/adjustments', label: 'Adjustments', icon: SlidersHorizontal, exact: false },
  { href: '/admin/settings', label: 'Settings', icon: Settings, exact: false },
];

interface AdminSidebarProps {
  email: string;
}

export function AdminSidebar({ email }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex md:w-64 flex-col bg-[#0B2341] shadow-xl flex-shrink-0 sticky top-0 h-screen">
        {/* Header */}
        <div className="border-b border-white/10 px-5 py-5 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <Image
              src="/nabams-logo.png"
              alt="NABAMS"
              width={36}
              height={36}
              className="h-9 w-auto object-contain flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-sky-300 leading-tight">
                NABAMS TPI
              </p>
              <p className="text-sm font-semibold text-white leading-tight">Electoral Admin</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 truncate">{email}</p>
        </div>

        {/* Nav — scrollable if links overflow */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition duration-150 ${
                  isActive
                    ? 'bg-sky-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/10 font-medium'
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout — pinned to bottom */}
        <div className="flex-shrink-0 border-t border-white/10 p-3 bg-[#091C35]">
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

      {/* ── Mobile Top Bar ── */}
      <div className="flex items-center gap-3 border-b border-slate-200 bg-[#0B2341] px-4 py-3 md:hidden shadow-sm">
        <p className="font-bold text-sky-300 text-sm">NABAMS Admin</p>
        <div className="ml-auto flex gap-1">
          {NAV.map(({ href, icon: Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-lg p-2 transition-colors ${
                  isActive
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="h-4 w-4" />
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
