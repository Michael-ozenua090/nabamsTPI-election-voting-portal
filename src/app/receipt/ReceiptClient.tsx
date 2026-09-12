'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Printer, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { logoutVoter } from '@/app/actions/auth';

interface ReceiptClientProps {
  fullName: string;
  maskedMatric: string;
  votedAt: string | null;
}

function formatTimestamp(ts: string | null): string {
  if (!ts) return 'N/A';
  try {
    const d = new Date(ts);
    return d.toLocaleString('en-NG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Africa/Lagos',
    });
  } catch {
    return ts;
  }
}

export function ReceiptClient({ fullName, maskedMatric, votedAt }: ReceiptClientProps) {
  const [referenceCode, setReferenceCode] = useState('');
  const [votedAtDisplay, setVotedAtDisplay] = useState(formatTimestamp(votedAt));

  useEffect(() => {
    const ref = sessionStorage.getItem('nabams_ref') ?? '';
    const storedAt = sessionStorage.getItem('nabams_voted_at');
    if (ref) setReferenceCode(ref);
    if (storedAt) setVotedAtDisplay(formatTimestamp(storedAt));
    // Clear after reading
    sessionStorage.removeItem('nabams_ref');
    sessionStorage.removeItem('nabams_voted_at');
  }, []);

  return (
    <main className="min-h-screen bg-nabams-dark flex flex-col items-center justify-center px-4 py-12 print:bg-white print:min-h-0">
      {/* Background glows (hidden on print) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none print:hidden">
        <div className="absolute top-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-nabams-green/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-nabams-gold/15 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Receipt card */}
        <div
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden print:border print:border-gray-300 print:bg-white print:shadow-none print:rounded-lg"
          id="voting-receipt"
        >
          {/* Header stripe */}
          <div className="bg-nabams-green px-6 py-5 text-center print:bg-green-700">
            <p className="text-xs font-bold uppercase tracking-widest text-green-200 print:text-green-100">
              NABAMS TPI — Official Document
            </p>
            <h1 className="mt-1 text-xl font-extrabold text-white">
              Digital Voting Receipt
            </h1>
          </div>

          {/* Success icon */}
          <div className="flex flex-col items-center pt-8 pb-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-nabams-gold/40 bg-nabams-gold/10">
              <CheckCircle className="h-9 w-9 text-nabams-gold" />
            </div>
            <p className="mt-3 text-lg font-bold text-white print:text-black">
              Vote Successfully Cast!
            </p>
          </div>

          {/* Details */}
          <dl className="mx-6 my-6 divide-y divide-white/8 rounded-xl border border-white/10 bg-white/5 print:divide-gray-200 print:border-gray-200 print:bg-gray-50">
            {[
              { label: 'Student Name', value: fullName },
              { label: 'Matric Number', value: maskedMatric },
              { label: 'Time of Vote', value: votedAtDisplay },
              {
                label: 'Reference Code',
                value: referenceCode || '(Loading…)',
                highlight: true,
              },
            ].map(({ label, value, highlight }) => (
              <div key={label} className="flex flex-col gap-0.5 px-4 py-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-400 print:text-gray-500">
                  {label}
                </dt>
                <dd
                  className={[
                    'text-sm font-semibold break-all',
                    highlight
                      ? 'font-mono text-nabams-gold text-base print:text-green-700'
                      : 'text-white print:text-black',
                  ].join(' ')}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          {/* Disclaimer */}
          <p className="mx-6 mb-6 text-xs text-gray-500 text-center print:text-gray-400">
            Keep this reference code as proof of participation. Ballot secrecy is
            maintained — your specific choices are not recorded here.
          </p>

          {/* NABAMS seal */}
          <div className="border-t border-white/10 bg-white/3 px-6 py-4 text-center print:border-gray-200">
            <p className="text-xs text-gray-500 print:text-gray-400">
              The Polytechnic, Ibadan — NABAMS Executive Elections{' '}
              {new Date().getFullYear()}
            </p>
          </div>
        </div>

        {/* Action buttons (hidden on print) */}
        <div className="mt-6 flex gap-3 print:hidden">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="flex-1"
          >
            <Printer className="h-4 w-4" />
            Print / Save
          </Button>
          <form action={logoutVoter} className="flex-1">
            <Button variant="primary" type="submit" fullWidth>
              <Home className="h-4 w-4" />
              Done
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
