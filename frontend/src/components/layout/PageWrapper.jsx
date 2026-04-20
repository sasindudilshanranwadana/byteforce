import { cn } from '../../lib/utils';

export default function PageWrapper({ children, className, maxWidth = '7xl' }) {
  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <main className={cn('min-h-screen page-enter', className)}>
      <div className={cn('mx-auto px-4 sm:px-6 lg:px-8 py-8', maxWidths[maxWidth] ?? maxWidths['7xl'])}>
        {children}
      </div>
    </main>
  );
}
