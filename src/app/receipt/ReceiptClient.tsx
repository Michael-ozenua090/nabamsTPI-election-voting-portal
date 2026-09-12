'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Printer, Home } from 'lucide-react';
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
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12 print:bg-white print:min-h-0">
      <div className="w-full max-w-md">
        {/* Receipt card */}
        <div
          className="bg-white border-2 border-slate-200 rounded-2xl shadow-md overflow-hidden relative print:shadow-none print:rounded-lg"
          id="voting-receipt"
        >
          {/* Top ribbon */}
          <div className="h-2 bg-gradient-to-r from-sky-400 via-sky-600 to-sky-500 print:bg-sky-600" />

          {/* Header */}
          <div className="bg-sky-600 px-6 py-5 text-center print:bg-sky-700">
            <p className="text-xs font-bold uppercase tracking-widest text-sky-100">
              NABAMS TPI — Official Document
            </p>
            <h1 className="mt-1 text-xl font-extrabold text-white">
              Digital Voting Receipt
            </h1>
          </div>

          {/* Success icon */}
          <div className="flex flex-col items-center pt-8 pb-2">
            <div className="w-16 h-16 bg-sky-50 border border-sky-200 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-9 w-9 text-sky-600" />
            </div>
            <p className="text-lg font-bold text-slate-900 print:text-black">
              Vote Successfully Cast!
            </p>
          </div>

          {/* Details */}
          <dl className="mx-6 my-6 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-slate-50 print:divide-gray-200 print:border-gray-200 print:bg-gray-50">
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
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 print:text-gray-500">
                  {label}
                </dt>
                <dd
                  className={[
                    'text-sm font-semibold break-all',
                    highlight
                      ? 'bg-slate-100 border border-slate-200 rounded-lg p-2 text-center font-mono font-bold text-lg text-sky-900 tracking-wider print:text-sky-900'
                      : 'text-slate-900 print:text-black',
                  ].join(' ')}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          {/* Disclaimer */}
          <p className="mx-6 mb-6 text-xs text-slate-500 text-center print:text-gray-400">
            Keep this reference code as proof of participation. Ballot secrecy is
            maintained — your specific choices are not recorded here.
          </p>

          {/* Footer seal */}
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-center print:border-gray-200">
            <p className="text-xs text-slate-400 print:text-gray-400">
              The Polytechnic, Ibadan — NABAMS Executive Elections{' '}
              {new Date().getFullYear()}
            </p>
          </div>
        </div>

        {/* Action buttons (hidden on print) */}
        <div className="mt-6 flex gap-3 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium py-2.5 rounded-lg text-sm transition duration-150 focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <Printer className="h-4 w-4" />
            Print / Save
          </button>
          <form action={logoutVoter} className="flex-1">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-medium py-2.5 rounded-lg text-sm transition duration-150 focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              <Home className="h-4 w-4" />
              Done
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
