import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Heart, ShieldCheck } from 'lucide-react';
import Logo from '../brand/Logo';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink-900 text-ink-300 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" aria-label="Byteforce home" className="inline-flex">
              <Logo size="md" withWordmark variant="light" />
            </Link>
            <p className="mt-4 text-sm text-ink-400 leading-relaxed max-w-sm">
              Where great ideas meet their backers. Fund creators, launch campaigns, and build the future together.
            </p>
            <div className="mt-5 flex gap-2">
              {[
                { icon: <Twitter size={15} />, href: '#', label: 'Twitter' },
                { icon: <Github size={15} />, href: '#', label: 'GitHub' },
                { icon: <Linkedin size={15} />, href: '#', label: 'LinkedIn' },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-ink-300 hover:bg-accent-500 hover:text-white transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <FooterCol
            title="Explore"
            links={[
              { to: '/',         label: 'Discover Campaigns' },
              { to: '/register', label: 'Start a Campaign' },
              { to: '/login',    label: 'Sign In' },
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { to: '#', label: 'About Us' },
              { to: '#', label: 'How It Works' },
              { to: '#', label: 'Blog' },
              { to: '#', label: 'Press Kit' },
            ]}
          />
          <FooterCol
            title="Legal"
            links={[
              { to: '#', label: 'Privacy Policy' },
              { to: '#', label: 'Terms of Service' },
              { to: '#', label: 'Cookie Policy' },
              { to: '#', label: 'Security' },
            ]}
          />
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-ink-400">
            &copy; {year} Byteforce. Built with <Heart size={11} className="inline text-accent-500 fill-accent-500 mb-0.5" /> by the PRT581 team.
          </p>
          <div className="flex items-center gap-2 text-xs text-ink-400">
            <ShieldCheck size={13} className="text-emerald-400" />
            Secured by <span className="font-semibold text-ink-200">Stripe</span> · Powered by <span className="font-semibold text-ink-200">Supabase</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-ink-200 mb-4">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.to}
              className="text-sm text-ink-400 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
