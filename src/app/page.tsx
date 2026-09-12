import type { Metadata } from 'next';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'NABAMS TPI - Executive Election Portal',
  description:
    'Official voting portal for the National Association of Business Administration and Management Students, The Polytechnic Ibadan, Oyo State.',
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-nabams-dark flex flex-col">
      {/* Hero gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-nabams-green/20 blur-3xl" />
        <div className="absolute -top-20 right-0 h-96 w-96 rounded-full bg-nabams-gold/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-nabams-green/15 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-12">
        {/* Branding */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl border-2 border-nabams-gold/40 bg-nabams-gold/10 mb-5 shadow-2xl shadow-yellow-900/30">
            <span className="text-4xl" role="img" aria-label="Ballot box">
              {'\uD83D\uDDF3\uFE0F'}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl tracking-tight">
            NABAMS TPI
          </h1>
          <p className="mt-1 text-sm font-medium text-nabams-gold uppercase tracking-widest">
            Executive Election Portal
          </p>
          <p className="mt-3 max-w-xs text-sm text-gray-400">
            The Polytechnic, Ibadan &mdash; Official Student Election
          </p>
        </div>

        {/* Login form */}
        <LoginForm />

        {/* Footer */}
        <p className="mt-8 text-xs text-gray-600">
          Eligible voters: ND1 &amp; HND1 (Full Time &amp; DPP) only
        </p>
      </div>
    </main>
  );
}
