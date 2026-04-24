import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMyCampaigns, useCampaignDonations } from '../hooks/useCampaigns';
import PageWrapper from '../components/layout/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import ProgressBar from '../components/campaigns/ProgressBar';
import { FullPageSpinner } from '../components/ui/Spinner';
import { formatCurrency, formatDate, getDaysLeft } from '../lib/utils';
import { PlusCircle, TrendingUp, Target, Calendar, ChevronRight } from 'lucide-react';

export default function CampaignerDashboardPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { data: campaigns, isLoading } = useMyCampaigns(user?.id);
  const [expandedId, setExpandedId] = useState(null);

  if (isLoading) return <FullPageSpinner />;

  const totalRaised = campaigns?.reduce((s, c) => s + c.raised_amount, 0) ?? 0;
  const activeCampaigns = campaigns?.filter((c) => c.status === 'active').length ?? 0;
  const pendingCampaigns = campaigns?.filter((c) => c.status === 'pending').length ?? 0;

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Avatar src={profile?.avatar_url} name={profile?.name} size="xl" />
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              {profile?.name}&apos;s Dashboard
            </h1>
            <p className="text-slate-500 mt-0.5">{user?.email}</p>
            <Badge variant="primary" className="mt-1 capitalize">{profile?.role}</Badge>
          </div>
        </div>
        <Button onClick={() => navigate('/campaigns/create')}>
          <PlusCircle size={16} />
          New Campaign
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={<TrendingUp size={20} className="text-emerald-500" />} label="Total Raised" value={formatCurrency(totalRaised)} bg="bg-emerald-50" />
        <StatCard icon={<Target size={20} className="text-primary-500" />} label="Active Campaigns" value={activeCampaigns} bg="bg-primary-50" />
        <StatCard icon={<Calendar size={20} className="text-amber-500" />} label="Pending Review" value={pendingCampaigns} bg="bg-amber-50" />
      </div>

      {/* Campaigns */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>My Campaigns</CardTitle>
            <span className="text-sm text-slate-500">{campaigns?.length ?? 0} total</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!campaigns?.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-5xl mb-3">🚀</span>
              <h3 className="font-semibold text-slate-800">No campaigns yet</h3>
              <p className="text-sm text-slate-500 mt-1">Launch your first campaign and start raising funds.</p>
              <Button className="mt-4" onClick={() => navigate('/campaigns/create')}>
                <PlusCircle size={15} />
                Create Campaign
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {campaigns.map((campaign) => (
                <div key={campaign.id}>
                  <div
                    className="px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setExpandedId(expandedId === campaign.id ? null : campaign.id)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {campaign.image_url ? (
                          <img src={campaign.image_url} alt={campaign.title} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 text-xl">💡</div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-slate-900 truncate">{campaign.title}</h3>
                            <Badge variant={campaign.status}>{campaign.status}</Badge>
                          </div>
                          <div className="mt-1.5">
                            <ProgressBar raised={campaign.raised_amount} goal={campaign.goal_amount} size="sm" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="font-bold text-slate-900">{formatCurrency(campaign.raised_amount)}</p>
                          <p className="text-xs text-slate-500">of {formatCurrency(campaign.goal_amount)}</p>
                        </div>
                        <div className="text-right hidden sm:block">
                          <p className="font-bold text-slate-900">{getDaysLeft(campaign.deadline)}</p>
                          <p className="text-xs text-slate-500">days left</p>
                        </div>
                        <ChevronRight
                          size={16}
                          className={`text-slate-400 transition-transform duration-200 ${expandedId === campaign.id ? 'rotate-90' : ''}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expanded: donations */}
                  {expandedId === campaign.id && (
                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-slate-700">Recent Backers</h4>
                        <Link
                          to={`/campaigns/${campaign.id}`}
                          className="text-xs text-primary-600 hover:underline"
                        >
                          View campaign →
                        </Link>
                      </div>
                      <CampaignDonations campaignId={campaign.id} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

function CampaignDonations({ campaignId }) {
  const { data: donations, isLoading } = useCampaignDonations(campaignId);

  if (isLoading) return <p className="text-sm text-slate-500">Loading backers...</p>;
  if (!donations?.length) return <p className="text-sm text-slate-500">No completed donations yet.</p>;

  return (
    <div className="space-y-2">
      {donations.slice(0, 5).map((d) => (
        <div key={d.id} className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Avatar src={d.profiles?.avatar_url} name={d.profiles?.name} size="xs" />
            <span className="text-slate-700">{d.profiles?.name ?? 'Anonymous'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">{formatCurrency(d.amount)}</span>
            <span className="text-slate-400 text-xs">{formatDate(d.created_at, 'MMM d')}</span>
          </div>
        </div>
      ))}
      {donations.length > 5 && (
        <p className="text-xs text-slate-400">+ {donations.length - 5} more backers</p>
      )}
    </div>
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
