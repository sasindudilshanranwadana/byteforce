import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAllCampaigns, useUpdateCampaignStatus } from '../hooks/useCampaigns';
import { useAuth } from '../context/AuthContext';
import PageWrapper from '../components/layout/PageWrapper';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import { FullPageSpinner } from '../components/ui/Spinner';
import { toast } from '../components/ui/Toast';
import { formatCurrency, formatDate, getCategoryMeta } from '../lib/utils';
import {
  Shield, CheckCircle, XCircle, PauseCircle, ExternalLink, Sparkles, AlertTriangle,
} from 'lucide-react';

const STATUS_TABS = ['all', 'pending', 'active', 'suspended', 'rejected', 'closed'];

export default function AdminDashboardPage() {
  const { profile } = useAuth();
  const { data: campaigns, isLoading } = useAllCampaigns();
  const { mutateAsync: updateStatus } = useUpdateCampaignStatus();
  const [activeTab, setActiveTab] = useState('pending');
  const [loadingId, setLoadingId] = useState(null);
  const [rejectModal, setRejectModal] = useState(null); // { id, title }
  const [rejectReason, setRejectReason] = useState('');

  if (isLoading) return <FullPageSpinner />;

  const filtered =
    activeTab === 'all' ? campaigns : campaigns?.filter((c) => c.status === activeTab);

  const counts = STATUS_TABS.reduce((acc, s) => {
    acc[s] = s === 'all' ? campaigns?.length ?? 0 : campaigns?.filter((c) => c.status === s).length ?? 0;
    return acc;
  }, {});

  async function changeStatus(id, status, rejection_reason) {
    setLoadingId(id);
    try {
      await updateStatus({ id, status, rejection_reason });
      toast.success(`Campaign ${status}`);
    } catch (err) {
      toast.error(err.message ?? 'Failed to update status');
    } finally {
      setLoadingId(null);
    }
  }

  async function handleRejectConfirm() {
    if (!rejectReason.trim()) return;
    await changeStatus(rejectModal.id, 'rejected', rejectReason.trim());
    setRejectModal(null);
    setRejectReason('');
  }

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-primary-700 via-primary-800 to-purple-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-mesh-hero opacity-80 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-20">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-md flex items-center justify-center">
              <Shield size={26} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                <Sparkles size={12} /> Admin
              </div>
              <h1 className="font-display text-display-xs sm:text-display-sm text-white">
                Moderation
              </h1>
              <p className="text-white/70 mt-1.5 text-sm">Review and manage campaigns across the platform.</p>
            </div>
          </div>
        </div>
      </div>

      <PageWrapper>
        {/* Status tabs */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 -mt-12 relative z-10 mb-8">
          {STATUS_TABS.map((s, i) => {
            const active = activeTab === s;
            return (
              <motion.button
                key={s}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                onClick={() => setActiveTab(s)}
                className={`rounded-3xl p-4 text-center transition-all ${
                  active
                    ? 'bg-ink-900 text-white shadow-pop'
                    : 'bg-white border border-ink-100 text-ink-600 hover:border-ink-300 shadow-card hover:shadow-card-hover'
                }`}
              >
                <p className="font-display text-2xl font-extrabold">{counts[s]}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider mt-1 capitalize opacity-80">{s}</p>
              </motion.button>
            );
          })}
        </div>

        {/* Campaigns table */}
        <div className="rounded-3xl bg-white border border-ink-100 shadow-card overflow-hidden">
          <div className="px-6 py-5 border-b border-ink-100 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-extrabold text-ink-900 capitalize">{activeTab} campaigns</h2>
              <p className="text-xs text-ink-500 mt-0.5">{filtered?.length ?? 0} showing</p>
            </div>
          </div>

          {!filtered?.length ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
                <CheckCircle size={26} />
              </div>
              <h3 className="font-display text-lg font-extrabold text-ink-900">All clear</h3>
              <p className="text-sm text-ink-500 mt-1">No {activeTab} campaigns at the moment.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-ink-50 text-left">
                    {['Campaign', 'Creator', 'Goal', 'Raised', 'Status', 'Created', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-ink-500 first:pl-6 last:pr-6">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {filtered.map((campaign) => {
                    const cat = getCategoryMeta(campaign.category);
                    return (
                      <tr key={campaign.id} className="hover:bg-ink-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 max-w-xs">
                            {campaign.image_url ? (
                              <img src={campaign.image_url} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                            ) : (
                              <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-lg bg-gradient-to-br ${cat.gradient}`}>
                                {cat.emoji}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-ink-900 line-clamp-1">{campaign.title}</p>
                              <p className="text-xs text-ink-400 capitalize">{campaign.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Avatar src={campaign.profiles?.avatar_url} name={campaign.profiles?.name} size="xs" />
                            <span className="text-ink-700 truncate max-w-[100px] font-medium">
                              {campaign.profiles?.name ?? 'Unknown'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-semibold text-ink-700">{formatCurrency(campaign.goal_amount)}</td>
                        <td className="px-4 py-4 font-display font-extrabold text-emerald-600">{formatCurrency(campaign.raised_amount)}</td>
                        <td className="px-4 py-4">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                            campaign.status === 'active'    ? 'bg-emerald-100 text-emerald-700'
                            : campaign.status === 'pending'  ? 'bg-amber-100 text-amber-700'
                            : campaign.status === 'rejected' ? 'bg-accent-100 text-accent-700'
                            : campaign.status === 'suspended'? 'bg-orange-100 text-orange-700'
                            : 'bg-ink-100 text-ink-600'
                          }`}>{campaign.status}</span>
                          {campaign.status === 'rejected' && campaign.rejection_reason && (
                            <p className="text-[10px] text-ink-400 mt-1 max-w-[120px] line-clamp-2" title={campaign.rejection_reason}>
                              {campaign.rejection_reason}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4 text-ink-500 text-xs">{formatDate(campaign.created_at, 'MMM d, yy')}</td>
                        <td className="px-4 py-4 pr-6">
                          <div className="flex items-center gap-1 flex-wrap">
                            <Link
                              to={`/campaigns/${campaign.id}`}
                              className="p-1.5 rounded-lg text-ink-400 hover:text-primary-700 hover:bg-primary-50 transition-colors"
                              title="View"
                            >
                              <ExternalLink size={14} />
                            </Link>
                            {campaign.status === 'pending' && (
                              <>
                                <ActionButton
                                  icon={<CheckCircle size={14} />} label="Approve"
                                  color="text-emerald-600 hover:bg-emerald-50"
                                  loading={loadingId === campaign.id}
                                  onClick={() => changeStatus(campaign.id, 'active')}
                                />
                                <ActionButton
                                  icon={<XCircle size={14} />} label="Reject"
                                  color="text-accent-600 hover:bg-accent-50"
                                  loading={loadingId === campaign.id}
                                  onClick={() => { setRejectModal({ id: campaign.id, title: campaign.title }); setRejectReason(''); }}
                                />
                              </>
                            )}
                            {campaign.status === 'active' && (
                              <ActionButton
                                icon={<PauseCircle size={14} />} label="Suspend"
                                color="text-amber-600 hover:bg-amber-50"
                                loading={loadingId === campaign.id}
                                onClick={() => changeStatus(campaign.id, 'suspended')}
                              />
                            )}
                            {campaign.status === 'suspended' && (
                              <ActionButton
                                icon={<CheckCircle size={14} />} label="Restore"
                                color="text-emerald-600 hover:bg-emerald-50"
                                loading={loadingId === campaign.id}
                                onClick={() => changeStatus(campaign.id, 'active')}
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </PageWrapper>

      {/* Rejection reason modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-accent-50 text-accent-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-ink-900">Reject campaign</h3>
                <p className="text-xs text-ink-500 line-clamp-1">{rejectModal.title}</p>
              </div>
            </div>
            <label className="block text-sm font-semibold text-ink-700 mb-1.5">
              Reason for rejection <span className="text-accent-600">*</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Campaign description is too vague. Please provide more detail about how funds will be used."
              rows={4}
              maxLength={500}
              className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-ink-400 mt-1 text-right">{rejectReason.length}/500</p>
            <p className="text-xs text-ink-500 mt-2">The campaigner will see this reason on their dashboard.</p>
            <div className="flex gap-3 mt-5">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setRejectModal(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-accent-600 hover:bg-accent-700"
                disabled={!rejectReason.trim() || loadingId === rejectModal.id}
                onClick={handleRejectConfirm}
              >
                <XCircle size={15} /> Reject Campaign
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
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
