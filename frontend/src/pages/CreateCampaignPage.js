import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function CreateCampaignPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', goalAmount: '', deadline: '', category: 'General', imageUrl: '' });
  const [rewardTiers, setRewardTiers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const addTier = () => setRewardTiers([...rewardTiers, { title: '', minimumAmount: '', description: '' }]);
  const updateTier = (i, field, value) => { const t = [...rewardTiers]; t[i][field] = value; setRewardTiers(t); };
  const removeTier = (i) => setRewardTiers(rewardTiers.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post('/campaigns', { ...form, goalAmount: parseFloat(form.goalAmount), rewardTiers });
      navigate(`/campaigns/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create campaign.');
    } finally { setLoading(false); }
  };

  return (
    <div className="container" style={{ maxWidth: 700, padding: '40px 24px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Create a Campaign</h1>
      <p style={{ color: '#6b7280', marginBottom: 32, fontSize: 14 }}>Fill in the details below. Your campaign will be reviewed by an admin before going live.</p>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Campaign Title</label>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Give your campaign a compelling title" required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe your project, why it matters, and how funds will be used" required style={{ minHeight: 160 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label>Funding Goal (AUD)</label>
            <input type="number" min="1" step="0.01" value={form.goalAmount} onChange={e => setForm({ ...form, goalAmount: e.target.value })} placeholder="e.g. 5000" required />
          </div>
          <div className="form-group">
            <label>Deadline</label>
            <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} min={new Date().toISOString().split('T')[0]} required />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {['Technology','Art','Music','Film','Food','Health','Education','Community','General'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Image URL (optional)</label>
            <input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
          </div>
        </div>

        {/* Reward Tiers */}
        <div style={{ margin: '24px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontWeight: 700 }}>Reward Tiers <span style={{ fontSize: 13, fontWeight: 400, color: '#6b7280' }}>(optional)</span></h3>
            <button type="button" onClick={addTier} className="btn btn-secondary btn-sm">+ Add Tier</button>
          </div>
          {rewardTiers.map((tier, i) => (
            <div key={i} className="card" style={{ padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, marginBottom: 10 }}>
                <input placeholder="Tier title" value={tier.title} onChange={e => updateTier(i, 'title', e.target.value)} style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6 }} />
                <input type="number" placeholder="Minimum amount ($)" value={tier.minimumAmount} onChange={e => updateTier(i, 'minimumAmount', e.target.value)} style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6 }} />
                <button type="button" onClick={() => removeTier(i)} className="btn btn-danger btn-sm">✕</button>
              </div>
              <textarea placeholder="What do backers receive?" value={tier.description} onChange={e => updateTier(i, 'description', e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, minHeight: 60 }} />
            </div>
          ))}
        </div>

        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Campaign for Review'}
        </button>
      </form>
    </div>
  );
}
