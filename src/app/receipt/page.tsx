import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getVoterSession } from '@/lib/session';
import { createAdminSupabaseClient } from '@/lib/supabase/server';
import { ReceiptClient } from './ReceiptClient';

export const metadata: Metadata = {
  title: 'Voting Receipt — NABAMS TPI Election',
  description: 'Your official digital voting receipt and verification code.',
};

export default async function ReceiptPage() {
  const session = await getVoterSession();
  if (!session) redirect('/');

  const supabase = createAdminSupabaseClient();
  const { data: voter } = await supabase
    .from('voters')
    .select('has_voted, full_name, voted_at, matric_number')
    .eq('matric_number', session.matric_number)
    .single();

  if (!voter?.has_voted) redirect('/ballot');

  // Mask matric: show first 4 and last 3, replace middle with ***
  const matric = voter.matric_number as string;
  const maskedMatric =
    matric.length >= 7
      ? matric.substring(0, 4) + '******' + matric.substring(matric.length - 3)
      : matric;

  return (
    <ReceiptClient
      fullName={voter.full_name as string}
      maskedMatric={maskedMatric}
      votedAt={voter.voted_at as string | null}
    />
  );
}
