import type { Metadata } from 'next';
import { getPaginatedVoters } from '@/app/actions/admin';
import { VotersClient } from './VotersClient';

export const metadata: Metadata = { title: 'Voter Roll — NABAMS TPI Admin' };
export const dynamic = 'force-dynamic';

export default async function VotersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const search = typeof searchParams.search === 'string' ? searchParams.search : '';
  const level = typeof searchParams.level === 'string' ? searchParams.level : '';
  const programme = typeof searchParams.programme === 'string' ? searchParams.programme : '';
  const status = typeof searchParams.status === 'string' ? searchParams.status : '';
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'accredited_desc';

  const { voters, total, totalPages, currentPage } = await getPaginatedVoters({
    page: isNaN(page) || page < 1 ? 1 : page,
    pageSize: 50,
    search,
    level,
    programme,
    status,
    sort,
  });

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900">Voter Roll</h1>
      <p className="text-sm text-slate-500">
        Manage late accreditations, view upload status, and explore {total} registered voters.
      </p>
      <VotersClient
        voters={voters as any}
        total={total}
        totalPages={totalPages}
        currentPage={currentPage}
        initialSearch={search}
        initialLevel={level}
        initialProgramme={programme}
        initialStatus={status}
        initialSort={sort}
      />
    </div>
  );
}
