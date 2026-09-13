'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { logoutAdmin } from '@/app/actions/admin';
import {
  Menu,
  X,
  LayoutDashboard,
  BarChart3,
  PlusCircle,
  Users,
  SlidersHorizontal,
  Settings,
  LogOut,
} from 'lucide-react';

const NAV = [
  { href: '/admin',             label: 'Dashboard',   icon: LayoutDashboard,  exact: true  },
  { href: '/admin/results',     label: 'Live Results', icon: BarChart3,        exact: false },
  { href: '/admin/candidates',  label: 'Candidates',  icon: PlusCircle,       exact: false },
  { href: '/admin/voters',      label: 'Voter Roll',  icon: Users,            exact: false },
  { href: '/admin/adjustments', label: 'Adjustments', icon: SlidersHorizontal,exact: false },
  { href: '/admin/settings',    label: 'Settings',    icon: Settings,         exact: false },
];

interface AdminSidebarProps {
  email: string;
}

export function AdminSidebar({ email }: AdminSidebarProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <>
      {/* ══════════════════════════════════════════════
          MOBILE TOP HEADER (visible below md breakpoint)
          ══════════════════════════════════════════════ */}
      <header className="md:hidden bg-[#0B2341] text-white h-16 flex items-center justify-between px-4 border-b border-slate-800 flex-shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white p-0.5 flex items-center justify-center flex-shrink-0">
            <Image
              src="/nabams-logo.png"
              alt="NABAMS Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">NABAMS Admin</p>
            <p className="text-[10px] text-sky-300 leading-tight">The Polytechnic, Ibadan</p>
          </div>
        </div>

        {/* Hamburger */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* ══════════════════════════════════════════════
          MOBILE DRAWER BACKDROP
          ══════════════════════════════════════════════ */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ══════════════════════════════════════════════
          MOBILE SLIDE-OUT DRAWER
          ══════════════════════════════════════════════ */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 w-72 bg-[#0B2341] text-white z-50 shadow-2xl flex flex-col transform transition-transform duration-200 ease-in-out ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white p-1 flex items-center justify-center flex-shrink-0">
              <Image src="/nabams-logo.png" alt="NABAMS Logo" width={36} height={36} className="object-contain" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">NABAMS TPI</p>
              <p className="text-xs text-sky-400 leading-tight">Electoral Admin</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setDrawerOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition ${
                  active
                    ? 'bg-sky-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Drawer logout */}
        <div className="flex-shrink-0 px-3 py-4 border-t border-slate-800 bg-[#091C35]">
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span>Logout</span>
            </button>
          </form>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════
          DESKTOP STICKY SIDEBAR (md and above)
          ══════════════════════════════════════════════ */}
      <aside className="hidden md:flex md:w-64 flex-col bg-[#0B2341] shadow-xl flex-shrink-0 sticky top-0 h-screen">
        {/* Desktop header */}
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

        {/* Desktop nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition duration-150 ${
                  active
                    ? 'bg-sky-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/10 font-medium'
                }`}
              >
                <Icon className={`h-4 w-4 flex-shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop logout — pinned to bottom */}
        <div className="flex-shrink-0 border-t border-white/10 p-3 bg-[#091C35]">
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-red-600/20 hover:text-red-300 transition duration-150"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
