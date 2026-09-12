import type { Metadata } from 'next';
import AdminLoginForm from './AdminLoginForm';

export const metadata: Metadata = {
  title: 'Admin Login — NABAMS TPI Electoral System',
};

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Institutional branding */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0B2341] mb-4 shadow-lg">
            <span className="text-3xl" role="img" aria-label="Admin">🔒</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Electoral Administration</h1>
          <p className="mt-1 text-sm text-slate-500">NABAMS TPI — Restricted Access</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
          <AdminLoginForm />
        </div>
      </div>
    </main>
  );
}
