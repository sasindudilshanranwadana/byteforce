import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useMyDonations } from '../hooks/useCampaigns';
import PageWrapper from '../components/layout/PageWrapper';
import { FullPageSpinner } from '../components/ui/Spinner';
import DonationHistoryTable from '../components/donations/DonationHistoryTable';
import { formatCurrency } from '../lib/utils';
import { Heart, Calendar, Hash, Filter, Sparkles } from 'lucide-react';

export default function BackerDonationHistoryPage() {
  const { user } = useAuth();
  const { data: donations = [], isLoading } = useMyDonations(user?.id);
  const [statusFilter, setStatusFilter] = useState('all');

  const stats = useMemo(() => {
    const completed = donations.filter((d) => d.status === 'completed');
    const totalDonated = completed.reduce((s, d) => s + Number(d.amount), 0);
    const projectsBacked = new Set(completed.map((d) => d.campaign_id)).size;
    const pendingCount = donations.filter((d) => d.status === 'pending').length;
    return { totalDonated, projectsBacked, pendingCount, total: donations.length };
  }, [donations]);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return donations;
    return donations.filter((d) => d.status === statusFilter);
  }, [donations, statusFilter]);

  if (isLoading) return <FullPageSpinner />;

  const statCards = [
    { icon: Heart,    label: 'Total Donated',  value: formatCurrency(stats.totalDonated), accent: 'from-accent-500 to-rose-600' },
    { icon: Hash,     label: 'Projects',       value: stats.projectsBacked,                accent: 'from-primary-500 to-purple-600' },
    { icon: Calendar, label: 'Pending',        value: stats.pendingCount,                  accent: 'from-amber-500 to-orange-600' },
    { icon: Filter,   label: 'Total Records',  value: stats.total,                         accent: 'from-emerald-500 to-teal-600' },
  ];

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-primary-700 via-primary-800 to-purple-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-mesh-hero opacity-80 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-20">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 mb-3">
            <Sparkles size={12} /> Backer
          </div>
          <h1 className="font-display text-display-xs sm:text-display-sm text-white">My donations</h1>
          <p className="text-white/70 mt-2 text-sm max-w-xl">
            Every campaign you&apos;ve supported on Byteforce — past, pending, and complete.
          </p>
        </div>
      </div>

      <PageWrapper>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 -mt-12 relative z-10 mb-8">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className="rounded-3xl bg-white border border-ink-100 shadow-pop p-5"
            >
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.accent} text-white shadow-soft mb-3`}>
                <stat.icon size={16} />
              </div>
              <div className="font-display text-xl font-extrabold text-ink-900 leading-none">
                {stat.value}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-ink-500 mt-1.5">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filter + Table */}
        <div className="rounded-3xl bg-white border border-ink-100 shadow-card overflow-hidden">
          <div className="border-b border-ink-100 px-6 py-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-extrabold text-ink-900">Donation history</h2>
              <p className="text-xs text-ink-500 mt-0.5">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex gap-1.5">
              {['all', 'completed', 'pending', 'failed'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                    statusFilter === s
                      ? 'bg-ink-900 text-white shadow-soft'
                      : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="p-2 sm:p-4">
            <DonationHistoryTable
              donations={filtered}
              emptyMessage={
                statusFilter === 'all'
                  ? 'You haven\'t backed any campaigns yet.'
                  : `No ${statusFilter} donations.`
              }
            />
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}
