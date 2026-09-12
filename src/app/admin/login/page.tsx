import type { Metadata } from 'next';
import AdminLoginForm from './AdminLoginForm';

export const metadata: Metadata = {
  title: 'Admin Login — NABAMS TPI Electoral System',
};

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-nabams-dark flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 h-64 w-64 rounded-full bg-nabams-green/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-nabams-gold/10 blur-3xl" />
      </div>
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-nabams-gold/30 bg-nabams-gold/10 mb-4">
            <span className="text-3xl" role="img" aria-label="Admin">🔒</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Electoral Admin</h1>
          <p className="mt-1 text-sm text-gray-400">NABAMS TPI — Restricted Access</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl">
          <AdminLoginForm />
        </div>
      </div>
    </main>
  );
}
