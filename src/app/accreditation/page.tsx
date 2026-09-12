import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getVoterSession } from '@/lib/session';
import { AccreditationForm } from './AccreditationForm';
import { InstitutionalHeader } from '@/components/InstitutionalHeader';

export const metadata: Metadata = {
  title: 'Accreditation — NABAMS TPI Election',
  description: 'Complete your accreditation to receive your digital ballot.',
};

export default async function AccreditationPage() {
  const session = await getVoterSession();
  if (!session) redirect('/');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <InstitutionalHeader />

      <main className="flex flex-1 flex-col items-center px-4 py-8 sm:py-12">
        {/* Page header */}
        <div className="w-full max-w-lg mb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 border border-sky-200 px-3 py-1 mb-3">
            <span className="text-xs font-semibold text-sky-800 uppercase tracking-wide">{session.level}</span>
            <span className="h-3 w-px bg-sky-300" />
            <span className="text-xs text-sky-700 font-mono">{session.matric_number}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Student Accreditation
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Complete your profile to receive your digital ballot
          </p>
        </div>

        {/* Form card */}
        <div className="w-full max-w-lg bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8">
          <AccreditationForm voterName={session.full_name} />
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-4">
        <p className="text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} NABAMS TPI Electoral Committee
        </p>
      </footer>
    </div>
  );
}
