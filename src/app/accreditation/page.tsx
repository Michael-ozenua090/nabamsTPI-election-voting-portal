import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getVoterSession } from '@/lib/session';
import { AccreditationForm } from './AccreditationForm';

export const metadata: Metadata = {
  title: 'Document Upload — NABAMS TPI Election',
  description: 'Upload your passport photo and student ID card to complete accreditation.',
};

export default async function AccreditationPage() {
  const session = await getVoterSession();
  if (!session) redirect('/');

  return (
    <main className="min-h-screen bg-nabams-dark flex flex-col">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-nabams-gold/8 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-nabams-green/15 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-nabams-gold/30 bg-nabams-gold/10 mb-4">
            <span className="text-3xl" role="img" aria-label="ID card">🪪</span>
          </div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Accreditation — Step 2
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Upload your documents to complete accreditation
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-nabams-gold/30 bg-nabams-gold/10 px-3 py-1">
            <span className="text-xs font-semibold text-nabams-gold uppercase tracking-wide">
              {session.level}
            </span>
            <span className="h-3 w-px bg-nabams-gold/30" />
            <span className="text-xs text-gray-400">{session.matric_number}</span>
          </div>
        </div>

        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl">
          <AccreditationForm voterName={session.full_name} />
        </div>
      </div>
    </main>
  );
}
