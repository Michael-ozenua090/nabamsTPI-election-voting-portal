import type { Metadata } from 'next';
import AgentDashboard from './AgentDashboard';
import { getAgentLiveResults } from '@/app/actions/agent';

export const metadata: Metadata = {
  title: 'Agent Dashboard — NABAMS TPI Electoral Portal',
};
export const dynamic = 'force-dynamic';

export default async function AgentPage() {
  const initialData = await getAgentLiveResults();

  return (
    <main className="min-h-screen bg-slate-50">
      <AgentDashboard initialData={initialData} />
    </main>
  );
}
