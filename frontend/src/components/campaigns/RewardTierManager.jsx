import { useState } from 'react';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import {
  useRewardTiers,
  useCreateRewardTier,
  useUpdateRewardTier,
  useDeleteRewardTier,
} from '../../hooks/useRewardTiers';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import { formatCurrency } from '../../lib/utils';
import { toast } from 'sonner';

// SCRUM-22: Campaigner-facing CRUD UI for reward tiers
// Used on CampaignerDashboardPage (per-campaign management)

export default function RewardTierManager({ campaignId }) {
  const { data: tiers = [], isLoading } = useRewardTiers(campaignId);
  const createTier = useCreateRewardTier();
  const updateTier = useUpdateRewardTier();
  const deleteTier = useDeleteRewardTier();

  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ title: '', description: '', minimum_amount: '' });

  const resetDraft = () => setDraft({ title: '', description: '', minimum_amount: '' });

  const handleCreate = async () => {
    try {
      await createTier.mutateAsync({ campaign_id: campaignId, ...draft });
      toast.success('Reward tier created');
      resetDraft();
    } catch (e) {
      toast.error(e.message || 'Failed to create reward tier');
    }
  };

  const handleUpdate = async (tier) => {
    try {
      await updateTier.mutateAsync({
        id: tier.id,
        campaign_id: campaignId,
        title: draft.title,
        description: draft.description,
        minimum_amount: Number(draft.minimum_amount),
      });
      toast.success('Reward tier updated');
      setEditingId(null);
      resetDraft();
    } catch (e) {
      toast.error(e.message || 'Failed to update reward tier');
    }
  };

  const handleDelete = async (tier) => {
    if (!confirm(`Delete reward tier "${tier.title}"?`)) return;
    try {
      await deleteTier.mutateAsync({ id: tier.id, campaign_id: campaignId });
      toast.success('Reward tier deleted');
    } catch (e) {
      toast.error(e.message || 'Failed to delete reward tier');
    }
  };

  const startEdit = (tier) => {
    setEditingId(tier.id);
    setDraft({
      title: tier.title,
      description: tier.description || '',
      minimum_amount: String(tier.minimum_amount),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetDraft();
  };

  if (isLoading) return <p className="text-sm text-slate-500">Loading reward tiers…</p>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Reward Tiers</h3>

      {tiers.length === 0 && (
        <p className="text-sm text-slate-500">
          No reward tiers yet. Add one below to incentivise backers.
        </p>
      )}

      {tiers.map((tier) =>
        editingId === tier.id ? (
          <div key={tier.id} className="rounded-2xl border border-primary-300 bg-primary-50/30 p-4 space-y-3">
            <Input
              label="Title"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="e.g. Early Supporter"
            />
            <Textarea
              label="Description"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="What backers get at this tier"
              rows={2}
            />
            <Input
              label="Minimum Amount ($)"
              type="number"
              min="1"
              step="1"
              value={draft.minimum_amount}
              onChange={(e) => setDraft({ ...draft, minimum_amount: e.target.value })}
            />
            <div className="flex gap-2">
              <Button onClick={() => handleUpdate(tier)} disabled={updateTier.isPending}>
                <Save size={14} /> Save
              </Button>
              <Button variant="ghost" onClick={cancelEdit}>
                <X size={14} /> Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div key={tier.id} className="rounded-2xl border border-slate-200 bg-white p-4 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-900">{tier.title}</p>
                <span className="text-sm text-primary-600 font-medium">
                  Pledge {formatCurrency(tier.minimum_amount)}+
                </span>
              </div>
              {tier.description && (
                <p className="mt-1 text-sm text-slate-600">{tier.description}</p>
              )}
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => startEdit(tier)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700"
                aria-label="Edit tier"
              >
                <Edit2 size={15} />
              </button>
              <button
                onClick={() => handleDelete(tier)}
                className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600"
                aria-label="Delete tier"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        )
      )}

      {/* Create new */}
      <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-4 space-y-3">
        <h4 className="font-medium text-slate-700">Add new reward tier</h4>
        <Input
          label="Title"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          placeholder="e.g. Founder's Edition"
          disabled={editingId !== null}
        />
        <Textarea
          label="Description"
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          placeholder="Describe what's included"
          rows={2}
          disabled={editingId !== null}
        />
        <Input
          label="Minimum Amount ($)"
          type="number"
          min="1"
          step="1"
          value={draft.minimum_amount}
          onChange={(e) => setDraft({ ...draft, minimum_amount: e.target.value })}
          disabled={editingId !== null}
        />
        <Button
          onClick={handleCreate}
          disabled={createTier.isPending || editingId !== null || !draft.title || !draft.minimum_amount}
        >
          <Plus size={14} /> Add Reward Tier
        </Button>
      </div>
    </div>
  );
}
