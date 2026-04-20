import { Link } from 'react-router-dom';
import { Heart, Sparkles, ShieldCheck, Globe, BadgeCheck } from 'lucide-react';
import Logo from '../brand/Logo';

const TESTIMONIALS = [
  { quote: 'Funded in 9 days. Byteforce backers are the most engaged community we\'ve ever pitched to.', author: 'Maya R.', role: 'Hardware creator' },
  { quote: 'Hit 142% of our goal in 3 weeks. The progress dashboard is unreal.',                            author: 'Theo K.', role: 'Music producer' },
];

export default function AuthLayout({ children, title, subtitle, variant = 'login' }) {
  const t = TESTIMONIALS[variant === 'login' ? 0 : 1];
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Visual side */}
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-800 to-purple-900 text-white">
        <div className="absolute inset-0 bg-mesh-hero opacity-90 pointer-events-none" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-accent-500/25 rounded-full blur-3xl animate-float pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-purple-500/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link to="/" className="inline-flex items-center w-fit">
            <Logo size="md" withWordmark />
          </Link>

          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 ring-1 ring-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-md mb-5">
              <Sparkles size={12} className="text-amber-300" />
              Fund what matters
            </div>

            <h2 className="font-display text-display-sm leading-[1.05] text-white">
              {variant === 'login'
                ? 'Welcome back.\nLet\'s keep the momentum going.'
                : 'Build something\nworth backing.'}
            </h2>

            <div className="mt-8 rounded-3xl bg-white/10 backdrop-blur-xl ring-1 ring-white/20 p-5 max-w-md">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-accent-500 text-white flex items-center justify-center shrink-0">
                  <Heart size={16} className="fill-white" />
                </div>
                <div>
                  <p className="text-sm text-white/90 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                  <p className="mt-2 text-xs text-white/60 font-semibold">— {t.author}, {t.role}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-300" />
              <span>Stripe-secured</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-amber-300" />
              <span>60+ countries</span>
            </div>
            <div className="flex items-center gap-2">
              <BadgeCheck size={14} className="text-pink-300" />
              <span>Verified creators</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center px-6 sm:px-12 py-12 bg-ink-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex flex-col items-center">
            <Link to="/" aria-label="Byteforce home">
              <Logo size="lg" withWordmark />
            </Link>
          </div>
          <div className="mb-8 text-center lg:text-left">
            <h1 className="font-display text-display-xs font-extrabold text-ink-900">{title}</h1>
            {subtitle && <p className="text-ink-500 mt-2 text-sm">{subtitle}</p>}
          </div>
          <div className="rounded-3xl bg-white border border-ink-100 shadow-pop p-8">
            {children}
          </div>
          <p className="mt-6 text-center text-xs text-ink-400">
            By continuing, you agree to our{' '}
            <Link to="#" className="underline hover:text-ink-600">Terms</Link>{' '}
            &{' '}
            <Link to="#" className="underline hover:text-ink-600">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
