import React from 'react';
import { Link } from 'react-router-dom';
import ProgressBar from './ProgressBar';

export default function CampaignCard({ campaign }) {
  const daysLeft = Math.max(0, Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24)));
  return (
    <Link to={`/campaigns/${campaign.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="card" style={{ transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
        <div style={{ height: 180, background: campaign.imageUrl ? `url(${campaign.imageUrl}) center/cover` : 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: '12px 12px 0 0' }}>
          <div style={{ padding: '12px', display: 'flex', justifyContent: 'flex-end' }}>
            <span className="badge badge-active" style={{ background: 'rgba(255,255,255,0.9)' }}>{campaign.category}</span>
          </div>
        </div>
        <div style={{ padding: 20 }}>
          <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>by {campaign.creator?.name}</p>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, lineHeight: 1.4,
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {campaign.title}
          </h3>
          <ProgressBar raised={campaign.raisedAmount} goal={campaign.goalAmount} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 13 }}>
            <span style={{ color: '#6b7280' }}>{daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}</span>
            <span style={{ fontWeight: 600, color: '#4f46e5' }}>Goal: ${Number(campaign.goalAmount).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
