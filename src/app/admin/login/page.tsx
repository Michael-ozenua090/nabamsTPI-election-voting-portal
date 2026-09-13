import type { Metadata } from 'next';
import Image from 'next/image';
import AdminLoginForm from './AdminLoginForm';

export const metadata: Metadata = {
  title: 'Admin Login — NABAMS TPI Electoral Portal',
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl bg-white border border-slate-200 shadow-md rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* ── LEFT COLUMN: NABAMS Departmental Identity ── */}
        <div className="bg-gradient-to-br from-sky-50 via-slate-50 to-sky-100/50 p-8 sm:p-12 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-200">
          {/* NABAMS logo */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 mb-6 drop-shadow-sm">
            <Image
              src="/nabams-logo.png"
              alt="NABAMS TPI Official Seal"
              fill
              className="object-contain"
              priority
            />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-[#012169] tracking-tight mb-2">
            NABAMS TPI
          </h2>

          <p className="text-sm font-semibold text-sky-800 mb-1">
            Department of Business Administration &amp; Management
          </p>

          <p className="text-xs text-slate-500 max-w-xs mb-1">
            National Association of Business Administration and Management Students
          </p>

          <p className="text-xs italic text-slate-400 max-w-xs mb-4">
            "Towards Cultured Oriented Management"
          </p>

          <p className="text-xs text-slate-400 mb-5">
            The Polytechnic, Ibadan • 2026 Executive Elections
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-sky-200 rounded-full text-sky-800 text-xs font-medium shadow-sm">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            Electoral Commission Portal
          </div>
        </div>

        {/* ── RIGHT COLUMN: The Polytechnic Crest & Login Form ── */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <div className="text-center mb-6">
            {/* Poly logo replaces the old padlock icon */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4">
              <Image
                src="/poly-logo.png"
                alt="The Polytechnic, Ibadan Crest"
                fill
                className="object-contain"
                priority
              />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Electoral Administration
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Restricted Access — Authorized Electoral Officers Only
            </p>
          </div>

          {/* Form component — logic untouched */}
          <AdminLoginForm />

          <div className="mt-8 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              Sessions automatically expire after 1 hour of inactivity.
            </p>
            <a
              href="/"
              className="inline-block mt-2 text-xs font-medium text-sky-600 hover:text-sky-700 transition"
            >
              ← Return to Student Voter Portal
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
