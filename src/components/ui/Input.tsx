import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-gray-300"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={[
            'w-full rounded-xl border px-4 py-3 text-white placeholder-gray-500',
            'bg-white/5 backdrop-blur-sm',
            'focus:outline-none focus:ring-2 focus:ring-nabams-green focus:border-transparent',
            'transition-all duration-200',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-white/10 hover:border-white/20',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-gray-500">{hint}</p>
        )}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
