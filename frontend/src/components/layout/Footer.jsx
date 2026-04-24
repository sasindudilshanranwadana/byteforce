import { Link } from 'react-router-dom';
import { Zap, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-100 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-purple-600">
                <Zap size={16} className="text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                Byteforce
              </span>
            </Link>
            <p className="mt-3 text-sm text-slate-500 leading-relaxed">
              Fund the future. Back bold ideas and help creators bring their visions to life.
            </p>
            <div className="mt-4 flex gap-3">
              {[
                { icon: <Twitter size={16} />, href: '#', label: 'Twitter' },
                { icon: <Github size={16} />, href: '#', label: 'GitHub' },
                { icon: <Linkedin size={16} />, href: '#', label: 'LinkedIn' },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-primary-100 hover:text-primary-600 transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Columns */}
          <FooterCol
            title="Explore"
            links={[
              { to: '/', label: 'Discover Campaigns' },
              { to: '/register', label: 'Start a Campaign' },
              { to: '/login', label: 'Sign In' },
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { to: '#', label: 'About Us' },
              { to: '#', label: 'How It Works' },
              { to: '#', label: 'Blog' },
              { to: '#', label: 'Press' },
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

        <div className="mt-10 border-t border-slate-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            &copy; {year} Byteforce. All rights reserved. Built by the PRT581 Byteforce Team.
          </p>
          <p className="text-xs text-slate-400">
            Payments secured by <span className="font-semibold">Stripe</span> · Data by <span className="font-semibold">Supabase</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-900 mb-3">{title}</h4>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.to}
              className="text-sm text-slate-500 hover:text-primary-600 transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
