import Image from 'next/image';

export function InstitutionalHeader() {
  return (
    <header className="bg-white border-b-2 border-sky-500 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Left: Poly Logo */}
        <div className="flex-shrink-0">
          <Image
            src="/poly-logo.png"
            alt="The Polytechnic, Ibadan Crest"
            width={48}
            height={48}
            className="h-12 w-auto object-contain"
            priority
          />
        </div>

        {/* Center: Branding */}
        <div className="flex-1 text-center">
          <p className="text-xs sm:text-sm font-bold tracking-wider text-slate-900 uppercase leading-tight">
            The Polytechnic, Ibadan
          </p>
          <p className="text-xs font-semibold text-sky-800 leading-tight mt-0.5">
            Department of Business Administration &amp; Management
          </p>
          <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
            NABAMS 2026 Executive General Election
          </p>
        </div>

        {/* Right: NABAMS Logo */}
        <div className="flex-shrink-0">
          <Image
            src="/nabams-logo.png"
            alt="NABAMS Official Seal"
            width={48}
            height={48}
            className="h-12 w-auto object-contain"
            priority
          />
        </div>
      </div>
    </header>
  );
}
