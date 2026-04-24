import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { toast } from '../ui/Toast';
import { Menu, X, Zap, ChevronDown, LogOut, LayoutDashboard, PlusCircle, User } from 'lucide-react';
import { cn } from '../../lib/utils';

const navLinks = [
  { to: '/', label: 'Discover' },
];

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function handleSignOut() {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch {
      toast.error('Failed to sign out');
    }
    setDropdownOpen(false);
  }

  function getDashboardPath() {
    if (profile?.role === 'admin') return '/admin';
    if (profile?.role === 'campaigner') return '/dashboard/campaigner';
    return '/dashboard/backer';
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-purple-600 shadow-sm group-hover:shadow-md transition-shadow">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              Byteforce
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end
                className={({ isActive }) =>
                  cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {(profile?.role === 'campaigner' || profile?.role === 'admin') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/campaigns/create')}
                  >
                    <PlusCircle size={14} />
                    Start a Campaign
                  </Button>
                )}

                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-50 transition-colors"
                  >
                    <Avatar src={profile?.avatar_url} name={profile?.name} size="sm" />
                    <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">
                      {profile?.name ?? user.email}
                    </span>
                    <ChevronDown
                      size={14}
                      className={cn(
                        'text-slate-400 transition-transform duration-200',
                        dropdownOpen && 'rotate-180'
                      )}
                    />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-100 bg-white py-2 shadow-lg animate-fade-in">
                      <div className="border-b border-slate-100 px-4 pb-2 mb-1">
                        <p className="text-xs text-slate-500">Signed in as</p>
                        <p className="text-sm font-semibold text-slate-900 truncate">{user.email}</p>
                      </div>
                      <DropdownItem
                        icon={<LayoutDashboard size={15} />}
                        label="Dashboard"
                        to={getDashboardPath()}
                        onClick={() => setDropdownOpen(false)}
                      />
                      {(profile?.role === 'campaigner' || profile?.role === 'admin') && (
                        <DropdownItem
                          icon={<PlusCircle size={15} />}
                          label="New Campaign"
                          to="/campaigns/create"
                          onClick={() => setDropdownOpen(false)}
                        />
                      )}
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={15} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
                <Button size="sm" onClick={() => navigate('/register')}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-2 animate-fade-in">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-slate-600 hover:bg-slate-50'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}

          {user ? (
            <>
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
                <Avatar src={profile?.avatar_url} name={profile?.name} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{profile?.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{profile?.role}</p>
                </div>
              </div>
              <NavLink
                to={getDashboardPath()}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <LayoutDashboard size={15} /> Dashboard
              </NavLink>
              {(profile?.role === 'campaigner' || profile?.role === 'admin') && (
                <NavLink
                  to="/campaigns/create"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  <PlusCircle size={15} /> Start a Campaign
                </NavLink>
              )}
              <button
                onClick={() => { handleSignOut(); setMobileOpen(false); }}
                className="flex w-full items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut size={15} /> Sign Out
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Button variant="secondary" size="md" fullWidth onClick={() => { navigate('/login'); setMobileOpen(false); }}>
                Sign In
              </Button>
              <Button size="md" fullWidth onClick={() => { navigate('/register'); setMobileOpen(false); }}>
                Get Started
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

function DropdownItem({ icon, label, to, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
    >
      <span className="text-slate-400">{icon}</span>
      {label}
    </Link>
  );
}
