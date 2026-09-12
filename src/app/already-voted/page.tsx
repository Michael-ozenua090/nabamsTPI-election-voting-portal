import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Already Voted - NABAMS TPI Election',
};

export default function AlreadyVotedPage() {
  return (
    <main className="min-h-screen bg-nabams-dark flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-900/30 border border-green-700/40 mb-6">
          <CheckCircle className="h-10 w-10 text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          You've Already Voted
        </h1>
        <p className="mt-3 text-gray-400">
          Your ballot was successfully recorded. Each student may only vote once.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          If you believe this is an error, please contact the Electoral Officer at
          the accreditation desk immediately.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </main>
  );
}
