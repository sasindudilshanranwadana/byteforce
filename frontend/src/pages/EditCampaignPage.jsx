import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { useCampaign, useUpdateCampaign } from '../hooks/useCampaigns';
import { toast } from '../components/ui/Toast';
import PageWrapper from '../components/layout/PageWrapper';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { FullPageSpinner } from '../components/ui/Spinner';
import { CATEGORIES } from '../lib/utils';
import { Plus, Trash2, Save, AlertTriangle } from 'lucide-react';

const campaignSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(120),
  description: z.string().min(50, 'Description must be at least 50 characters').max(5000),
  category: z.string().min(1, 'Please select a category'),
  goal_amount: z
    .string()
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 100, {
      message: 'Goal must be at least $100',
    }),
  image_url: z.string().url('Enter a valid image URL').or(z.literal('')).optional(),
  deadline: z.string().refine((d) => new Date(d) > new Date(), {
    message: 'Deadline must be in the future',
  }),
  rewardTiers: z.array(
    z.object({
      title: z.string().min(3, 'Title required'),
      minimum_amount: z
        .string()
        .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 1, { message: 'Min $1' }),
      description: z.string().min(10, 'Description required (min 10 chars)'),
    })
  ),
});

export default function EditCampaignPage() {
  const { id } = useParams();
  const { profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { data: campaign, isLoading } = useCampaign(id);
  const { mutateAsync: updateCampaign, isPending: isSaving } = useUpdateCampaign();
  const [ready, setReady] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Warn user if they try to leave with unsaved changes
  useEffect(() => {
    const handler = (e) => {
      if (isDirty && !submitted) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty, submitted]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(campaignSchema),
    defaultValues: { rewardTiers: [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'rewardTiers' });

  // Populate form once campaign data loads
  useEffect(() => {
    if (!campaign) return;

    // Only creator or admin may edit
    if (campaign.creator_id !== profile?.id && !isAdmin) {
      toast.error('You do not have permission to edit this campaign.');
      navigate(`/campaigns/${id}`);
      return;
    }

    const deadlineDate = campaign.deadline
      ? new Date(campaign.deadline).toISOString().split('T')[0]
      : '';

    reset({
      title: campaign.title ?? '',
      description: campaign.description ?? '',
      category: campaign.category ?? '',
      goal_amount: String(campaign.goal_amount ?? ''),
      image_url: campaign.image_url ?? '',
      deadline: deadlineDate,
      rewardTiers: (campaign.reward_tiers ?? []).map((t) => ({
        title: t.title,
        minimum_amount: String(t.minimum_amount),
        description: t.description,
      })),
    });
    setReady(true);
  }, [campaign, profile, isAdmin, id, navigate, reset]);

  async function onSubmit(data) {
    try {
      const updatedCampaign = {
        title: data.title,
        description: data.description,
        category: data.category,
        goal_amount: parseFloat(data.goal_amount),
        image_url: data.image_url || null,
        deadline: new Date(data.deadline).toISOString(),
      };

      const rewardTiers = data.rewardTiers.map((t) => ({
        title: t.title,
        minimum_amount: parseFloat(t.minimum_amount),
        description: t.description,
      }));

      await updateCampaign({ id, campaign: updatedCampaign, rewardTiers });
      setSubmitted(true);
      toast.success('Campaign updated successfully!');
      navigate(`/campaigns/${id}`);
    } catch (err) {
      toast.error(err.message ?? 'Failed to update campaign');
    }
  }

  if (isLoading || !ready) return <FullPageSpinner />;

  const catOptions = CATEGORIES.map((c) => ({ value: c.value, label: `${c.emoji} ${c.label}` }));
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const isPendingOrActive = campaign?.status === 'pending' || campaign?.status === 'active';

  return (
    <PageWrapper maxWidth="3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Edit Campaign</h1>
        <p className="text-slate-500 mt-1">
          Update your campaign details below. Changes save immediately.
        </p>
      </div>

      {/* Warning for non-pending campaigns */}
      {campaign?.status === 'active' && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-200 p-4">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            This campaign is <strong>live</strong>. Backers may already have donated. Avoid changing
            the goal amount significantly or the deadline in a way that disadvantages existing backers.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <Input
              label="Campaign Title"
              placeholder="e.g. EcoTrack — Sustainable Living App"
              error={errors.title?.message}
              required
              {...register('title')}
            />
            <Textarea
              label="Description"
              placeholder="Tell potential backers about your project..."
              rows={6}
              error={errors.description?.message}
              required
              {...register('description')}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Select
                label="Category"
                options={catOptions}
                placeholder="Select a category"
                error={errors.category?.message}
                required
                {...register('category')}
              />
              <Input
                label="Funding Goal ($)"
                type="number"
                placeholder="5000"
                min="100"
                step="1"
                hint="Minimum $100"
                error={errors.goal_amount?.message}
                required
                {...register('goal_amount')}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Campaign Deadline"
                type="date"
                min={minDate}
                error={errors.deadline?.message}
                required
                {...register('deadline')}
              />
              <Input
                label="Cover Image URL"
                type="url"
                placeholder="https://..."
                hint="Optional — paste a direct image URL"
                error={errors.image_url?.message}
                {...register('image_url')}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Reward Tiers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-slate-500">
              Existing tiers will be replaced with what you set here.
            </p>
            {fields.map((field, i) => (
              <div key={field.id} className="rounded-2xl border border-slate-200 p-5 space-y-4 relative">
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
                <h4 className="font-semibold text-slate-700 text-sm">Tier {i + 1}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Tier Title"
                    placeholder="e.g. Early Bird"
                    error={errors.rewardTiers?.[i]?.title?.message}
                    required
                    {...register(`rewardTiers.${i}.title`)}
                  />
                  <Input
                    label="Minimum Amount ($)"
                    type="number"
                    placeholder="25"
                    min="1"
                    error={errors.rewardTiers?.[i]?.minimum_amount?.message}
                    required
                    {...register(`rewardTiers.${i}.minimum_amount`)}
                  />
                </div>
                <Textarea
                  label="What backers receive"
                  placeholder="e.g. Your name in the credits + exclusive digital download"
                  rows={2}
                  error={errors.rewardTiers?.[i]?.description?.message}
                  required
                  {...register(`rewardTiers.${i}.description`)}
                />
              </div>
            ))}

            <button
              type="button"
              onClick={() => append({ title: '', minimum_amount: '', description: '' })}
              className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              <Plus size={16} />
              Add Reward Tier
            </button>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              if (isDirty && !confirm('You have unsaved changes. Leave anyway?')) return;
              navigate(`/campaigns/${id}`);
            }}
          >
            Cancel
          </Button>
          <div className="flex items-center gap-3">
            {isDirty && !isSaving && (
              <span className="text-xs text-amber-600 font-semibold">Unsaved changes</span>
            )}
            <Button type="submit" disabled={isSaving}>
              <Save size={16} />
              {isSaving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </form>
    </PageWrapper>
  );
}
