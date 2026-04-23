import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProgressBar from '../components/ProgressBar';

export default function DonatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [amount, setAmount] = useState('');
  const [selectedTier, setSelectedTier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/campaigns/${id}`).then(res => setCampaign(res.data)).catch(() => navigate('/'));
  }, [id, navigate]);

  const handleDonate = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return setError('Please enter a valid amount.');
    setError(''); setLoading(true);
    try {
      const res = await api.post('/payments/checkout', { campaignId: id, amount: parseFloat(amount), rewardTierId: selectedTier });
      // In production: use Stripe Elements with res.data.clientSecret
      // For demo: simulate success and redirect
      alert(`✅ Donation of $${amount} AUD initiated!\nDonation ID: ${res.data.donationId}\n\nIn production, Stripe payment form would appear here.`);
      navigate(`/campaigns/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally { setLoading(false); }
  };

  if (!campaign) return <div style={{ textAlign: 'center', padding: 80 }}>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '40px 24px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div className="card" style={{ padding: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Back this project</h2>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>{campaign.title}</p>
          <ProgressBar raised={campaign.raisedAmount} goal={campaign.goalAmount} />

          {campaign.rewardTiers?.length > 0 && (
            <div style={{ margin: '24px 0' }}>
              <p style={{ fontWeight: 600, marginBottom: 12 }}>Select a reward tier (optional)</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div onClick={() => setSelectedTier(null)}
                  style={{ padding: 14, border: `2px solid ${!selectedTier ? '#4f46e5' : '#e2e8f0'}`, borderRadius: 8, cursor: 'pointer' }}>
                  <strong>No reward</strong> — just support the project
                </div>
                {campaign.rewardTiers.map(tier => (
                  <div key={tier.id} onClick={() => { setSelectedTier(tier.id); setAmount(String(tier.minimumAmount)); }}
                    style={{ padding: 14, border: `2px solid ${selectedTier === tier.id ? '#4f46e5' : '#e2e8f0'}`, borderRadius: 8, cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{tier.title}</strong><span style={{ color: '#4f46e5' }}>${tier.minimumAmount}+</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{tier.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleDonate}>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label>Donation Amount (AUD)</label>
              <input type="number" min="1" step="0.01" placeholder="Enter amount" value={amount}
                onChange={e => setAmount(e.target.value)} required />
            </div>
            <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16, marginBottom: 20, fontSize: 13, color: '#6b7280' }}>
              🔒 Payment processed securely via <strong>Stripe</strong> (sandbox mode) — no real money charged
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? 'Processing...' : `Donate $${amount || '0.00'} AUD`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
