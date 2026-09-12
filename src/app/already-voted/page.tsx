import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { InstitutionalHeader } from '@/components/InstitutionalHeader';

export const metadata: Metadata = {
  title: 'Already Voted - NABAMS TPI Election',
};

export default function AlreadyVotedPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <InstitutionalHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-sky-50 border border-sky-200 mb-6">
            <CheckCircle className="h-10 w-10 text-sky-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            You've Already Voted
          </h1>
          <p className="mt-3 text-slate-600">
            Your ballot was successfully recorded. Each student may only vote once.
          </p>
          <p className="mt-2 text-sm text-slate-400">
            If you believe this is an error, please contact the Electoral Officer at
            the accreditation desk immediately.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-5 py-3 text-sm font-medium text-slate-700 transition duration-150 focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            Return to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
