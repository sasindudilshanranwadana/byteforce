import { useState } from 'react';
import { Send, Trash2, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  useCampaignUpdates,
  useCreateCampaignUpdate,
  useDeleteCampaignUpdate,
} from '../../hooks/useCampaignUpdates';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Avatar from '../ui/Avatar';
import { formatDate } from '../../lib/utils';
import { toast } from 'sonner';

// SCRUM-23: Display + post campaign updates
// Two modes:
//   - readonly (backers, public): see the timeline
//   - editable (campaign owner): can post and delete updates

export default function CampaignUpdates({ campaign }) {
  const { user } = useAuth();
  const { data: updates = [], isLoading } = useCampaignUpdates(campaign.id);
  const createUpdate = useCreateCampaignUpdate();
  const deleteUpdate = useDeleteCampaignUpdate();

  const isOwner = user?.id && user.id === campaign.creator_id;

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const handlePost = async () => {
    try {
      await createUpdate.mutateAsync({
        campaign_id: campaign.id,
        author_id: user.id,
        title,
        body,
      });
      toast.success('Update posted — backers will be notified by email');
      setTitle('');
      setBody('');
    } catch (e) {
      toast.error(e.message || 'Failed to post update');
    }
  };

  const handleDelete = async (update) => {
    if (!confirm('Delete this update? Backers who already received emails cannot be un-notified.')) return;
    try {
      await deleteUpdate.mutateAsync({ id: update.id, campaign_id: campaign.id });
      toast.success('Update deleted');
    } catch (e) {
      toast.error(e.message || 'Failed to delete');
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="text-primary-600" size={20} />
        <h2 className="text-xl font-bold text-slate-900">Campaign Updates</h2>
        <span className="text-sm text-slate-500">({updates.length})</span>
      </div>

      {isOwner && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
          <h3 className="font-semibold text-slate-800">Post an update</h3>
          <Input
            label="Title"
            placeholder="Milestone reached!"
            maxLength={140}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            label="Body"
            placeholder="Share progress, photos, milestones with your backers…"
            rows={4}
            maxLength={5000}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              An email will be sent to all backers when you post.
            </p>
            <Button
              onClick={handlePost}
              disabled={createUpdate.isPending || !title.trim() || !body.trim()}
            >
              <Send size={14} /> Post Update
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading updates…</p>
      ) : updates.length === 0 ? (
        <p className="text-sm text-slate-500 italic">
          No updates yet{isOwner ? ' — be the first to post!' : '. Check back soon.'}
        </p>
      ) : (
        <ul className="space-y-4">
          {updates.map((u) => (
            <li
              key={u.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar src={u.profiles?.avatar_url} name={u.profiles?.name} size="sm" />
                  <div>
                    <p className="font-semibold text-slate-900">{u.profiles?.name || 'Campaign creator'}</p>
                    <p className="text-xs text-slate-500">{formatDate(u.created_at)}</p>
                  </div>
                </div>
                {isOwner && (
                  <button
                    onClick={() => handleDelete(u)}
                    className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"
                    aria-label="Delete update"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
              <h3 className="mt-3 font-bold text-slate-900">{u.title}</h3>
              <p className="mt-1 text-slate-700 leading-relaxed whitespace-pre-line">{u.body}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
