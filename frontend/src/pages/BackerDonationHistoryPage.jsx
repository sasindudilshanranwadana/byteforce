import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMyDonations } from '../hooks/useCampaigns';
import PageWrapper from '../components/layout/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { FullPageSpinner } from '../components/ui/Spinner';
import DonationHistoryTable from '../components/donations/DonationHistoryTable';
import { formatCurrency } from '../lib/utils';
import { Heart, Calendar, Hash, Filter } from 'lucide-react';

// SCRUM-27: Dedicated donation-history page for backers. Linked from
// the navbar and from BackerDashboardPage.

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

  return (
    <PageWrapper>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">My Donations</h1>
        <p className="text-slate-500 mt-1">Every campaign you've supported on Byteforce.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Heart size={20} className="text-rose-500" />} label="Total Donated" value={formatCurrency(stats.totalDonated)} bg="bg-rose-50" />
        <StatCard icon={<Hash size={20} className="text-primary-500" />} label="Projects Backed" value={stats.projectsBacked} bg="bg-primary-50" />
        <StatCard icon={<Calendar size={20} className="text-amber-500" />} label="Pending" value={stats.pendingCount} bg="bg-amber-50" />
        <StatCard icon={<Filter size={20} className="text-slate-500" />} label="Total Records" value={stats.total} bg="bg-slate-50" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Donation History</CardTitle>
            <div className="flex gap-1.5">
              {['all', 'completed', 'pending', 'failed'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                    statusFilter === s
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DonationHistoryTable
            donations={filtered}
            emptyMessage={
              statusFilter === 'all'
                ? 'You haven\'t backed any campaigns yet.'
                : `No ${statusFilter} donations.`
            }
          />
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

function StatCard({ icon, label, value, bg }) {
  return (
    <div className={`rounded-2xl p-4 ${bg}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <p className="text-xs font-medium text-slate-600">{label}</p>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
