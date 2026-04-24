import { cn, getInitials } from '../../lib/utils';

const sizes = {
  xs:  'w-6 h-6 text-xs',
  sm:  'w-8 h-8 text-xs',
  md:  'w-10 h-10 text-sm',
  lg:  'w-12 h-12 text-base',
  xl:  'w-16 h-16 text-lg',
  '2xl': 'w-20 h-20 text-xl',
};

export default function Avatar({ src, name, size = 'md', className }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name ?? 'Avatar'}
        className={cn(
          'rounded-full object-cover ring-2 ring-white',
          sizes[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full',
        'bg-gradient-to-br from-primary-500 to-purple-600 text-white font-semibold',
        'ring-2 ring-white shrink-0',
        sizes[size],
        className
      )}
      aria-label={name ?? 'User avatar'}
    >
      {getInitials(name)}
    </div>
  );
}
