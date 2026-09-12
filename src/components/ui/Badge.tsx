type Variant = 'green' | 'gold' | 'red' | 'gray' | 'blue' | 'sky';

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

const styles: Record<Variant, string> = {
  green: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  gold: 'bg-amber-50 text-amber-700 border border-amber-200',
  red: 'bg-red-50 text-red-700 border border-red-200',
  gray: 'bg-slate-100 text-slate-600 border border-slate-200',
  blue: 'bg-sky-50 text-sky-800 border border-sky-200',
  sky: 'bg-sky-50 text-sky-800 border border-sky-200',
};

export function Badge({ children, variant = 'gray', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
