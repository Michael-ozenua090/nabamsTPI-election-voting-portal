import type { Metadata } from 'next';
import { LoginForm } from './LoginForm';
import { InstitutionalHeader } from '@/components/InstitutionalHeader';

export const metadata: Metadata = {
  title: 'NABAMS TPI - Executive Election Portal',
  description:
    'Official voting portal for the National Association of Business Administration and Management Students, The Polytechnic Ibadan, Oyo State.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <InstitutionalHeader />

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-md space-y-6">
          {/* Welcome card */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 border border-sky-200 flex-shrink-0">
                <span className="text-xl" role="img" aria-label="Ballot box">🗳️</span>
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 leading-tight">Voter Accreditation</h1>
                <p className="text-xs text-slate-500 mt-0.5">Accredited Students Only &bull; ND &amp; HND</p>
              </div>
            </div>
            <LoginForm />
          </div>

          <p className="text-center text-xs text-slate-400">
            Eligible voters: Accredited Full-Time, DPP &amp; Part-Time Students (ND1, ND2, HND1, HND2) &nbsp;·&nbsp; Powered by NABAMS Electoral Committee
          </p>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-4">
        <p className="text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} NABAMS TPI Electoral Committee. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
