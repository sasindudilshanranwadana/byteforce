import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProgressBar from '../components/ProgressBar';

export default function CampaignerDashboardPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/campaigns/my').then(res => setCampaigns(res.data)).finally(() => setLoading(false));
  }, []);

  const totalRaised = campaigns.reduce((sum, c) => sum + parseFloat(c.raisedAmount || 0), 0);

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>My Campaigns</h1>
          <p style={{ color: '#6b7280' }}>Welcome back, {user?.name}</p>
        </div>
        <Link to="/create" className="btn btn-primary">+ New Campaign</Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Campaigns Created', value: campaigns.length, color: '#4f46e5' },
          { label: 'Active Campaigns', value: campaigns.filter(c => c.status === 'active').length, color: '#22c55e' },
          { label: 'Total Raised', value: `$${totalRaised.toFixed(2)}`, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div> : campaigns.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <p style={{ color: '#6b7280', marginBottom: 16 }}>You haven't created any campaigns yet.</p>
          <Link to="/create" className="btn btn-primary">Create Your First Campaign</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {campaigns.map(c => (
            <div key={c.id} className="card" style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700 }}>{c.title}</h3>
                  <span className={`badge badge-${c.status}`}>{c.status}</span>
                </div>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>{c.category} · Deadline: {c.deadline}</p>
                <ProgressBar raised={c.raisedAmount} goal={c.goalAmount} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <Link to={`/campaigns/${c.id}`} className="btn btn-secondary btn-sm">View</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
