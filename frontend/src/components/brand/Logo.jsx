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
        {/* Rocket — launch your idea */}
        <path
          d="M26.5 10.5C26.5 10.5 18 14 15 22c-1 2.8-1 6-1 6l6 6s3.2 0 6-1c8-3 11.5-11.5 11.5-11.5S32.5 8 26.5 10.5Z"
          fill="white" opacity="0.95"
        />
        <circle cx="25" cy="23" r="3.5" fill="url(#bf-mark-grad)" />
        <path d="M14 28l-4 4.5M13.5 34.5l-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
        <path d="M13 22c-3 1-5 4-5 4l3 3s2-1 3-3" fill="white" opacity="0.8"/>
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
