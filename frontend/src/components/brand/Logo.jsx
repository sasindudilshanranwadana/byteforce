import { cn } from '../../lib/utils';

const SIZES = {
  sm: { mark: 24, word: 'text-lg' },
  md: { mark: 32, word: 'text-xl' },
  lg: { mark: 44, word: 'text-2xl' },
};

export default function Logo({ size = 'md', withWordmark = true, className, variant = 'dark' }) {
  const { mark, word } = SIZES[size] || SIZES.md;

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg
        width={mark}
        height={mark}
        viewBox="0 0 48 48"
        fill="none"
        role="img"
        aria-label="Byteforce"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="bf-mark-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#4F46E5" />
            <stop offset="1" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="44" height="44" rx="11" fill="url(#bf-mark-grad)" />
        <path
          d="M27.6 9.5 14.8 26.4a1.2 1.2 0 0 0 .96 1.92h6.34l-3.36 9.66a.9.9 0 0 0 1.6.78l13.32-17.2a1.2 1.2 0 0 0-.95-1.93h-6.45l3.05-8.94a.92.92 0 0 0-1.7-.7Z"
          fill="#FFFFFF"
        />
      </svg>
      {withWordmark && (
        <span className={cn(
          'font-display font-extrabold tracking-tight',
          variant === 'light' ? 'text-white' : 'text-ink-900',
          word
        )}>
          Byteforce
        </span>
      )}
    </span>
  );
}
