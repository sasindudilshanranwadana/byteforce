import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMyNotifications, useMarkAllNotificationsRead } from '../../hooks/useNotifications';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { toast } from '../ui/Toast';
import { Menu, X, ChevronDown, LogOut, LayoutDashboard, PlusCircle, History, BarChart3, Bell } from 'lucide-react';
import Logo from '../brand/Logo';
import { cn, timeAgo } from '../../lib/utils';

const navLinks = [
  { to: '/', label: 'Discover' },
];

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);

  const { data: notifications = [] } = useMyNotifications(user?.id, { limit: 15 });
  const { mutate: markAllRead, isPending: markingRead } = useMarkAllNotificationsRead();
  const unread = notifications.filter((n) => !n.read_at).length;

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setBellOpen(false);
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
    <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-ink-100 shadow-soft">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" aria-label="Byteforce home">
            <Logo size="md" withWordmark />
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

                {/* Notification bell */}
                <div className="relative" ref={bellRef}>
                  <button
                    onClick={() => setBellOpen((v) => !v)}
                    className="relative h-9 w-9 rounded-xl text-ink-600 hover:bg-ink-100 transition-colors flex items-center justify-center"
                    aria-label="Notifications"
                  >
                    <Bell size={17} />
                    {unread > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-4 min-w-[16px] rounded-full bg-accent-500 px-1 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </button>
                  {bellOpen && (
                    <div className="absolute right-0 mt-2 w-80 max-h-[28rem] overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-pop animate-fade-in flex flex-col">
                      <div className="px-4 py-3 border-b border-ink-100 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-ink-900">Notifications</p>
                          {unread > 0 && (
                            <span className="inline-flex items-center justify-center min-w-[20px] h-5 rounded-full bg-accent-500 px-1.5 text-[10px] font-bold text-white">
                              {unread}
                            </span>
                          )}
                        </div>
                        {unread > 0 && (
                          <button
                            onClick={() => markAllRead()}
                            disabled={markingRead}
                            className="text-[11px] font-bold text-primary-700 hover:text-primary-800 disabled:opacity-50"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-10 text-center text-sm text-ink-500">
                            <Bell size={22} className="mx-auto mb-2 text-ink-300" />
                            You&apos;re all caught up.
                          </div>
                        ) : (
                          <ul className="divide-y divide-ink-100">
                            {notifications.slice(0, 10).map((n) => {
                              const isUnread = !n.read_at;
                              return (
                                <li
                                  key={n.id}
                                  className={`px-4 py-3 transition-colors ${isUnread ? 'bg-primary-50/40 hover:bg-primary-50' : 'hover:bg-ink-50'}`}
                                >
                                  <div className="flex items-start gap-2.5">
                                    <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${isUnread ? 'bg-accent-500' : 'bg-transparent ring-1 ring-ink-200'}`} />
                                    <div className="min-w-0 flex-1">
                                      <p className={`text-sm truncate ${isUnread ? 'font-bold text-ink-900' : 'font-medium text-ink-700'}`}>
                                        {n.subject ?? 'Notification'}
                                      </p>
                                      {n.campaigns?.title && (
                                        <p className="text-xs text-ink-500 truncate mt-0.5">on {n.campaigns.title}</p>
                                      )}
                                      <p className="text-[11px] text-ink-400 mt-0.5">{timeAgo(n.created_at)}</p>
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>

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
                    <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-ink-100 bg-white py-2 shadow-pop animate-fade-in">
                      <div className="border-b border-ink-100 px-4 pb-3 mb-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Signed in as</p>
                        <p className="text-sm font-bold text-ink-900 truncate mt-0.5">{profile?.name ?? user.email}</p>
                        <p className="text-xs text-ink-500 truncate">{user.email}</p>
                      </div>
                      <DropdownItem
                        icon={<LayoutDashboard size={15} />}
                        label="Dashboard"
                        to={getDashboardPath()}
                        onClick={() => setDropdownOpen(false)}
                      />
                      <DropdownItem
                        icon={<History size={15} />}
                        label="My Donations"
                        to="/dashboard/backer/donations"
                        onClick={() => setDropdownOpen(false)}
                      />
                      {(profile?.role === 'campaigner' || profile?.role === 'admin') && (
                        <>
                          <DropdownItem
                            icon={<BarChart3 size={15} />}
                            label="Analytics"
                            to="/dashboard/campaigner/analytics"
                            onClick={() => setDropdownOpen(false)}
                          />
                          <DropdownItem
                            icon={<PlusCircle size={15} />}
                            label="New Campaign"
                            to="/campaigns/create"
                            onClick={() => setDropdownOpen(false)}
                          />
                        </>
                      )}
                      <div className="border-t border-ink-100 mt-1 pt-1">
                        <button
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-2.5 px-4 py-2 text-sm font-semibold text-accent-600 hover:bg-accent-50 transition-colors"
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
      className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 hover:text-primary-700 transition-colors"
    >
      <span className="text-ink-400">{icon}</span>
      {label}
    </Link>
  );
}
