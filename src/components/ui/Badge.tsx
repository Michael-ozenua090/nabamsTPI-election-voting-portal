type Variant = 'green' | 'gold' | 'red' | 'gray' | 'blue';

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

const styles: Record<Variant, string> = {
  green: 'bg-green-900/50 text-green-300 border border-green-700/50',
  gold: 'bg-yellow-900/50 text-yellow-300 border border-yellow-700/50',
  red: 'bg-red-900/50 text-red-300 border border-red-700/50',
  gray: 'bg-gray-800 text-gray-300 border border-gray-700',
  blue: 'bg-blue-900/50 text-blue-300 border border-blue-700/50',
};

export function Badge({ children, variant = 'gray', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
