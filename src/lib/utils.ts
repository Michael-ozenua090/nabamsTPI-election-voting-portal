export function formatNigerianDateTime(dateString: string | null | undefined): string {
  if (!dateString) return 'Pending Accreditation';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'Invalid Date';

  // Format time in West Africa Time (WAT / Nigeria)
  const time = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Africa/Lagos',
  }).toLowerCase(); // e.g. "8:45am"

  const weekday = d.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Africa/Lagos' });
  const day = d.toLocaleDateString('en-US', { day: 'numeric', timeZone: 'Africa/Lagos' });
  const month = d.toLocaleDateString('en-US', { month: 'long', timeZone: 'Africa/Lagos' });
  const year = d.toLocaleDateString('en-US', { year: 'numeric', timeZone: 'Africa/Lagos' });

  return `${time}, ${weekday}, ${day} ${month} ${year}`;
}
