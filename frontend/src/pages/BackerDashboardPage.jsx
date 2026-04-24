import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMyDonations } from '../hooks/useCampaigns';
import PageWrapper from '../components/layout/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import { FullPageSpinner } from '../components/ui/Spinner';
import { formatCurrency, formatDate } from '../lib/utils';
import { Heart, ExternalLink, TrendingUp } from 'lucide-react';

export default function BackerDashboardPage() {
  const { user, profile } = useAuth();
  const { data: donations, isLoading } = useMyDonations(user?.id);

  if (isLoading) return <FullPageSpinner />;

  const totalDonated = donations
    ?.filter((d) => d.status === 'completed')
    .reduce((sum, d) => sum + d.amount, 0) ?? 0;

  const completedCount = donations?.filter((d) => d.status === 'completed').length ?? 0;

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Avatar src={profile?.avatar_url} name={profile?.name} size="xl" />
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Welcome back, {profile?.name?.split(' ')[0] ?? 'Backer'}!
          </h1>
          <p className="text-slate-500 mt-0.5">{user?.email}</p>
          <Badge variant="primary" className="mt-1 capitalize">{profile?.role}</Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={<Heart size={20} className="text-red-500" />}
          label="Total Backed"
          value={formatCurrency(totalDonated)}
          bg="bg-red-50"
        />
        <StatCard
          icon={<TrendingUp size={20} className="text-emerald-500" />}
          label="Campaigns Supported"
          value={completedCount}
          bg="bg-emerald-50"
        />
        <StatCard
          icon={<Heart size={20} className="text-primary-500" />}
          label="Pending Pledges"
          value={donations?.filter((d) => d.status === 'pending').length ?? 0}
          bg="bg-primary-50"
        />
      </div>

      {/* Donations list */}
      <Card>
        <CardHeader>
          <CardTitle>My Donations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!donations?.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-5xl mb-3">🎯</span>
              <h3 className="font-semibold text-slate-800">No donations yet</h3>
              <p className="text-sm text-slate-500 mt-1">Browse campaigns and back a project you love!</p>
              <Link
                to="/"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:underline"
              >
                Discover campaigns <ExternalLink size={13} />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {donations.map((donation) => (
                <div key={donation.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    {donation.campaigns?.image_url ? (
                      <img
                        src={donation.campaigns.image_url}
                        alt={donation.campaigns.title}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 text-xl">
                        💡
                      </div>
                    )}
                    <div className="min-w-0">
                      <Link
                        to={`/campaigns/${donation.campaign_id}`}
                        className="font-semibold text-slate-900 hover:text-primary-600 line-clamp-1 transition-colors"
                      >
                        {donation.campaigns?.title ?? 'Campaign'}
                      </Link>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {donation.reward_tiers?.title ? `Tier: ${donation.reward_tiers.title}` : 'No tier selected'} · {formatDate(donation.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-bold text-slate-900">{formatCurrency(donation.amount)}</span>
                    <Badge variant={donation.status}>{donation.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

function StatCard({ icon, label, value, bg }) {
  return (
    <div className={`rounded-2xl p-5 flex items-center gap-4 ${bg}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-xl font-extrabold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
