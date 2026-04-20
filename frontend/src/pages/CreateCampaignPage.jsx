import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { useCreateCampaign } from '../hooks/useCampaigns';
import { toast } from '../components/ui/Toast';
import PageWrapper from '../components/layout/PageWrapper';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { CATEGORIES } from '../lib/utils';
import { Plus, Trash2, ChevronRight, ChevronLeft, Rocket } from 'lucide-react';
import { cn } from '../lib/utils';

// ── Zod schema ────────────────────────────────────────────────────────────────
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
});

const rewardSchema = z.object({
  rewardTiers: z.array(
    z.object({
      title: z.string().min(3, 'Title required'),
      minimum_amount: z
        .string()
        .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 1, {
          message: 'Min $1',
        }),
      description: z.string().min(10, 'Description required (min 10 chars)'),
    })
  ),
});

const STEPS = ['Campaign Details', 'Reward Tiers', 'Review & Launch'];

export default function CreateCampaignPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { mutateAsync: createCampaign } = useCreateCampaign();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});

  // Step 1 form
  const step1 = useForm({ resolver: zodResolver(campaignSchema) });

  // Step 2 form
  const step2 = useForm({
    resolver: zodResolver(rewardSchema),
    defaultValues: { rewardTiers: [] },
  });
  const { fields, append, remove } = useFieldArray({
    control: step2.control,
    name: 'rewardTiers',
  });

  async function handleStep1(data) {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(1);
  }

  async function handleStep2(data) {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(2);
  }

  async function handleLaunch() {
    try {
      const campaign = {
        creator_id: profile.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        goal_amount: parseFloat(formData.goal_amount),
        image_url: formData.image_url || null,
        deadline: new Date(formData.deadline).toISOString(),
        status: 'pending',
      };

      const rewardTiers = (formData.rewardTiers ?? []).map((t) => ({
        title: t.title,
        minimum_amount: parseFloat(t.minimum_amount),
        description: t.description,
      }));

      const created = await createCampaign({ campaign, rewardTiers });
      toast.success('Campaign submitted for review!', { duration: 5000 });
      navigate(`/campaigns/${created.id}`);
    } catch (err) {
      toast.error(err.message ?? 'Failed to create campaign');
    }
  }

  const catOptions = CATEGORIES.map((c) => ({ value: c.value, label: `${c.emoji} ${c.label}` }));

  // min deadline date = tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <PageWrapper maxWidth="3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Launch a Campaign</h1>
        <p className="text-slate-500 mt-1">Fill in the details below to submit your campaign for review.</p>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center gap-0">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                    i < step
                      ? 'bg-primary-600 text-white'
                      : i === step
                      ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                      : 'bg-slate-100 text-slate-400'
                  )}
                >
                  {i < step ? '✓' : i + 1}
                </div>
                <span
                  className={cn(
                    'mt-1 text-xs font-medium text-center hidden sm:block',
                    i <= step ? 'text-primary-600' : 'text-slate-400'
                  )}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-1 transition-all',
                    i < step ? 'bg-primary-600' : 'bg-slate-200'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Campaign Details */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={step1.handleSubmit(handleStep1)} className="space-y-5" noValidate>
              <Input
                label="Campaign Title"
                placeholder="e.g. EcoTrack — Sustainable Living App"
                error={step1.formState.errors.title?.message}
                required
                {...step1.register('title')}
              />
              <Textarea
                label="Description"
                placeholder="Tell potential backers about your project, why it matters, and how the funds will be used..."
                rows={6}
                error={step1.formState.errors.description?.message}
                required
                {...step1.register('description')}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Select
                  label="Category"
                  options={catOptions}
                  placeholder="Select a category"
                  error={step1.formState.errors.category?.message}
                  required
                  {...step1.register('category')}
                />
                <Input
                  label="Funding Goal ($)"
                  type="number"
                  placeholder="5000"
                  min="100"
                  step="1"
                  hint="Minimum $100"
                  error={step1.formState.errors.goal_amount?.message}
                  required
                  {...step1.register('goal_amount')}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Campaign Deadline"
                  type="date"
                  min={minDate}
                  error={step1.formState.errors.deadline?.message}
                  required
                  {...step1.register('deadline')}
                />
                <Input
                  label="Cover Image URL"
                  type="url"
                  placeholder="https://..."
                  hint="Optional — paste a direct image URL"
                  error={step1.formState.errors.image_url?.message}
                  {...step1.register('image_url')}
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" size="lg">
                  Next: Reward Tiers <ChevronRight size={16} />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Reward Tiers */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Reward Tiers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 mb-5">
              Add optional reward tiers to incentivize backers. Backers can also donate without choosing a tier.
            </p>
            <form onSubmit={step2.handleSubmit(handleStep2)} className="space-y-5" noValidate>
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
                      error={step2.formState.errors.rewardTiers?.[i]?.title?.message}
                      required
                      {...step2.register(`rewardTiers.${i}.title`)}
                    />
                    <Input
                      label="Minimum Amount ($)"
                      type="number"
                      placeholder="25"
                      min="1"
                      error={step2.formState.errors.rewardTiers?.[i]?.minimum_amount?.message}
                      required
                      {...step2.register(`rewardTiers.${i}.minimum_amount`)}
                    />
                  </div>
                  <Textarea
                    label="What backers receive"
                    placeholder="e.g. Your name in the credits + exclusive digital download"
                    rows={2}
                    error={step2.formState.errors.rewardTiers?.[i]?.description?.message}
                    required
                    {...step2.register(`rewardTiers.${i}.description`)}
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

              <div className="flex justify-between pt-2">
                <Button type="button" variant="secondary" size="lg" onClick={() => setStep(0)}>
                  <ChevronLeft size={16} /> Back
                </Button>
                <Button type="submit" size="lg">
                  Next: Review <ChevronRight size={16} />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Launch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <ReviewRow label="Title" value={formData.title} />
            <ReviewRow label="Category" value={formData.category} />
            <ReviewRow label="Goal" value={`$${formData.goal_amount}`} />
            <ReviewRow label="Deadline" value={formData.deadline} />
            <ReviewRow
              label="Description"
              value={formData.description?.slice(0, 200) + (formData.description?.length > 200 ? '...' : '')}
            />
            {(formData.rewardTiers?.length ?? 0) > 0 && (
              <ReviewRow label="Reward Tiers" value={`${formData.rewardTiers.length} tier(s) defined`} />
            )}

            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
              <strong>Note:</strong> Your campaign will be submitted for admin review before going live. This typically takes 1–2 business days.
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="secondary" size="lg" onClick={() => setStep(1)}>
                <ChevronLeft size={16} /> Back
              </Button>
              <Button size="lg" onClick={handleLaunch}>
                <Rocket size={16} />
                Submit Campaign
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </PageWrapper>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex gap-4">
      <span className="w-28 shrink-0 text-sm font-medium text-slate-500">{label}</span>
      <span className="text-sm text-slate-900">{value}</span>
    </div>
  );
}
