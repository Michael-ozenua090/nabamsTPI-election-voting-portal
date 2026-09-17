import { notFound } from 'next/navigation';
import { createAdminSupabaseClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/Badge';
import { ResetVoterButton } from './ResetVoterButton';
import { User, CreditCard, ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatNigerianDateTime } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Voter Details — NABAMS TPI Admin' };
export const dynamic = 'force-dynamic';

export default async function VoterDetailPage({
  params,
}: {
  params: { matricNumber: string };
}) {
  const supabase = createAdminSupabaseClient();
  const { data: voter, error } = await supabase
    .from('voters')
    .select('*')
    .eq('matric_number', params.matricNumber)
    .single();

  if (error || !voter) {
    notFound();
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/voters">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to List
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-white ml-auto">Voter Details</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details Card */}
        <div className="md:col-span-2 bg-[#0d1f3c] border border-white/10 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white">{voter.full_name}</h2>
              <p className="text-sm font-mono text-nabams-gold mt-1">{voter.matric_number}</p>
            </div>
            <Badge variant={voter.level === 'ND1' ? 'green' : 'blue'} className="text-base px-3 py-1">
              {voter.level}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Programme</p>
              <p className="text-sm text-gray-300 font-medium mt-1">{voter.programme}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
              <p className="text-sm text-gray-300 font-medium mt-1">{voter.email || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Phone Number</p>
              <p className="text-sm text-gray-300 font-medium mt-1">{voter.phone_number || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Voting Status</p>
              <div className="mt-1 flex items-center gap-2">
                {voter.has_voted ? (
                  <span className="flex items-center gap-1.5 text-green-400 font-medium text-sm">
                    <CheckCircle className="h-4 w-4" /> Voted
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-gray-400 font-medium text-sm">
                    <Clock className="h-4 w-4" /> Pending
                  </span>
                )}
              </div>
            </div>

            {/* Date Added / Registered */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Date Added / Registered
              </p>
              <p className="text-sm font-medium text-gray-300 mt-1">
                {formatNigerianDateTime(voter.created_at || voter.updated_at)}
              </p>
            </div>

            {/* Accreditation Date */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Accreditation Completed
              </p>
              <p className="text-sm font-medium mt-1">
                {voter.accredited_at ? (
                  <span className="text-sky-400 font-semibold">
                    {formatNigerianDateTime(voter.accredited_at)}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Pending Accreditation
                  </span>
                )}
              </p>
            </div>

            {voter.has_voted && voter.voted_at && (
              <>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Ballot Cast At
                  </p>
                  <p className="text-sm font-semibold text-green-400 mt-1">
                    {formatNigerianDateTime(voter.voted_at)}
                  </p>
                </div>
                <div className="col-span-1 md:col-span-2 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Administrative Override</p>
                    <p className="text-xs text-gray-400 max-w-sm">
                      Resetting a student's voting status allows them to vote again. Their previous ballot remains irreversibly anonymized in the final tally.
                    </p>
                  </div>
                  <ResetVoterButton matricNumber={voter.matric_number} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Documents Card */}
        <div className="space-y-6">
          <div className="bg-[#0d1f3c] border border-white/10 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wide">Passport Photograph</h3>
            {voter.passport_url ? (
              <a href={voter.passport_url} target="_blank" rel="noopener noreferrer" className="block relative aspect-square rounded-xl overflow-hidden border border-white/10 group cursor-zoom-in">
                <img
                  src={voter.passport_url}
                  alt={`${voter.full_name} Passport`}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-white text-sm font-medium">View Full Image</span>
                </div>
              </a>
            ) : (
              <div className="aspect-square rounded-xl border border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center text-gray-500">
                <User className="h-10 w-10 mb-2 opacity-50" />
                <span className="text-xs">No Passport Uploaded</span>
              </div>
            )}
          </div>

          <div className="bg-[#0d1f3c] border border-white/10 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wide">School ID Card</h3>
            {voter.id_card_url ? (
              <a href={voter.id_card_url} target="_blank" rel="noopener noreferrer" className="block relative aspect-[1.6/1] rounded-xl overflow-hidden border border-white/10 group cursor-zoom-in">
                <img
                  src={voter.id_card_url}
                  alt={`${voter.full_name} ID Card`}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-white text-sm font-medium">View Full Image</span>
                </div>
              </a>
            ) : (
              <div className="aspect-[1.6/1] rounded-xl border border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center text-gray-500">
                <CreditCard className="h-10 w-10 mb-2 opacity-50" />
                <span className="text-xs">No ID Card Uploaded</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
