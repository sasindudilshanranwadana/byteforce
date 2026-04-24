import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAllCampaigns, useUpdateCampaignStatus } from '../hooks/useCampaigns';
import { useAuth } from '../context/AuthContext';
import PageWrapper from '../components/layout/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import { FullPageSpinner } from '../components/ui/Spinner';
import { toast } from '../components/ui/Toast';
import { formatCurrency, formatDate } from '../lib/utils';
import { Shield, CheckCircle, XCircle, PauseCircle, ExternalLink } from 'lucide-react';

const STATUS_TABS = ['all', 'pending', 'active', 'suspended', 'rejected', 'closed'];

export default function AdminDashboardPage() {
  const { profile } = useAuth();
  const { data: campaigns, isLoading } = useAllCampaigns();
  const { mutateAsync: updateStatus } = useUpdateCampaignStatus();
  const [activeTab, setActiveTab] = useState('pending');
  const [loadingId, setLoadingId] = useState(null);

  if (isLoading) return <FullPageSpinner />;

  const filtered =
    activeTab === 'all' ? campaigns : campaigns?.filter((c) => c.status === activeTab);

  const counts = STATUS_TABS.reduce((acc, s) => {
    acc[s] = s === 'all' ? campaigns?.length ?? 0 : campaigns?.filter((c) => c.status === s).length ?? 0;
    return acc;
  }, {});

  async function changeStatus(id, status) {
    setLoadingId(id);
    try {
      await updateStatus({ id, status });
      toast.success(`Campaign ${status}`);
    } catch (err) {
      toast.error(err.message ?? 'Failed to update status');
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-purple-600">
          <Shield size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500">Manage campaigns and platform content</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => setActiveTab(s)}
            className={`rounded-2xl p-4 text-center transition-all ${
              activeTab === s
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-white border border-slate-100 text-slate-600 hover:border-primary-200'
            }`}
          >
            <p className="text-2xl font-extrabold">{counts[s]}</p>
            <p className="text-xs font-medium capitalize mt-0.5">{s}</p>
          </button>
        ))}
      </div>

      {/* Campaigns table */}
      <Card>
        <CardHeader>
          <CardTitle className="capitalize">{activeTab} Campaigns</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!filtered?.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-5xl mb-3">✅</span>
              <h3 className="font-semibold text-slate-800">No {activeTab} campaigns</h3>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left">
                    <th className="px-6 py-3 font-semibold text-slate-500">Campaign</th>
                    <th className="px-4 py-3 font-semibold text-slate-500">Creator</th>
                    <th className="px-4 py-3 font-semibold text-slate-500">Goal</th>
                    <th className="px-4 py-3 font-semibold text-slate-500">Raised</th>
                    <th className="px-4 py-3 font-semibold text-slate-500">Status</th>
                    <th className="px-4 py-3 font-semibold text-slate-500">Created</th>
                    <th className="px-4 py-3 font-semibold text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 max-w-xs">
                          {campaign.image_url ? (
                            <img src={campaign.image_url} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 text-lg">💡</div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-900 line-clamp-1">{campaign.title}</p>
                            <p className="text-xs text-slate-400 capitalize">{campaign.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Avatar src={campaign.profiles?.avatar_url} name={campaign.profiles?.name} size="xs" />
                          <span className="text-slate-700 truncate max-w-[100px]">
                            {campaign.profiles?.name ?? 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-medium">{formatCurrency(campaign.goal_amount)}</td>
                      <td className="px-4 py-4 font-medium text-emerald-600">{formatCurrency(campaign.raised_amount)}</td>
                      <td className="px-4 py-4">
                        <Badge variant={campaign.status}>{campaign.status}</Badge>
                      </td>
                      <td className="px-4 py-4 text-slate-500">{formatDate(campaign.created_at, 'MMM d, yy')}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 flex-wrap">
                          <Link
                            to={`/campaigns/${campaign.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                            title="View"
                          >
                            <ExternalLink size={14} />
                          </Link>
                          {campaign.status === 'pending' && (
                            <>
                              <ActionButton
                                icon={<CheckCircle size={14} />}
                                label="Approve"
                                color="text-emerald-600 hover:bg-emerald-50"
                                loading={loadingId === campaign.id}
                                onClick={() => changeStatus(campaign.id, 'active')}
                              />
                              <ActionButton
                                icon={<XCircle size={14} />}
                                label="Reject"
                                color="text-red-500 hover:bg-red-50"
                                loading={loadingId === campaign.id}
                                onClick={() => changeStatus(campaign.id, 'rejected')}
                              />
                            </>
                          )}
                          {campaign.status === 'active' && (
                            <ActionButton
                              icon={<PauseCircle size={14} />}
                              label="Suspend"
                              color="text-amber-600 hover:bg-amber-50"
                              loading={loadingId === campaign.id}
                              onClick={() => changeStatus(campaign.id, 'suspended')}
                            />
                          )}
                          {campaign.status === 'suspended' && (
                            <ActionButton
                              icon={<CheckCircle size={14} />}
                              label="Restore"
                              color="text-emerald-600 hover:bg-emerald-50"
                              loading={loadingId === campaign.id}
                              onClick={() => changeStatus(campaign.id, 'active')}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

function ActionButton({ icon, label, color, loading, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      title={label}
      className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${color}`}
    >
      {icon}
    </button>
  );
}
