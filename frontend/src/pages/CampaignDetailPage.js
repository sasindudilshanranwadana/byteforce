import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProgressBar from '../components/ProgressBar';

export default function CampaignDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/campaigns/${id}`)
      .then(res => setCampaign(res.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Campaign link copied to clipboard!');
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}>Loading...</div>;
  if (!campaign) return null;

  const daysLeft = Math.max(0, Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: 900 }}>
      {/* Header */}
      <div style={{ background: campaign.imageUrl ? `url(${campaign.imageUrl}) center/cover` : 'linear-gradient(135deg,#667eea,#764ba2)',
        height: 340, borderRadius: 16, marginBottom: 32, position: 'relative' }}>
        <div style={{ position: 'absolute', bottom: 20, left: 20 }}>
          <span className="badge badge-active" style={{ background: 'rgba(255,255,255,0.9)' }}>{campaign.category}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40 }}>
        {/* Left */}
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8 }}>{campaign.title}</h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>by <strong>{campaign.creator?.name}</strong></p>
          <p style={{ lineHeight: 1.8, color: '#374151', whiteSpace: 'pre-wrap' }}>{campaign.description}</p>

          {campaign.rewardTiers?.length > 0 && (
            <div style={{ marginTop: 40 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Reward Tiers</h2>
              {campaign.rewardTiers.map(tier => (
                <div key={tier.id} className="card" style={{ padding: 20, marginBottom: 12, border: '2px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <strong>{tier.title}</strong>
                    <span style={{ color: '#4f46e5', fontWeight: 700 }}>${tier.minimumAmount}+</span>
                  </div>
                  <p style={{ fontSize: 14, color: '#6b7280' }}>{tier.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right - Funding sidebar */}
        <div>
          <div className="card" style={{ padding: 24, position: 'sticky', top: 80 }}>
            <ProgressBar raised={campaign.raisedAmount} goal={campaign.goalAmount} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, margin: '20px 0' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#1e293b' }}>{daysLeft}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Days Left</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#1e293b' }}>{campaign.donations?.length || 0}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Backers</div>
              </div>
            </div>

            {user && user.role === 'backer' && campaign.status === 'active' && (
              <Link to={`/donate/${campaign.id}`} className="btn btn-primary btn-full btn-lg" style={{ marginBottom: 12, display: 'block', textAlign: 'center' }}>
                Back This Project
              </Link>
            )}
            {!user && (
              <Link to="/login" className="btn btn-primary btn-full btn-lg" style={{ marginBottom: 12, display: 'block', textAlign: 'center' }}>
                Login to Back This Project
              </Link>
            )}
            <button onClick={handleShare} className="btn btn-secondary btn-full">
              🔗 Share Campaign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
