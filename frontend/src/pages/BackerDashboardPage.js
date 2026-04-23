import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function BackerDashboardPage() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/donations/history').then(res => setDonations(res.data)).finally(() => setLoading(false));
  }, []);

  const total = donations.filter(d => d.status === 'completed').reduce((sum, d) => sum + parseFloat(d.amount), 0);

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>My Donations</h1>
      <p style={{ color: '#6b7280', marginBottom: 32 }}>Welcome back, {user?.name}</p>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Donated', value: `$${total.toFixed(2)}`, color: '#4f46e5' },
          { label: 'Projects Backed', value: donations.filter(d => d.status === 'completed').length, color: '#22c55e' },
          { label: 'Pending', value: donations.filter(d => d.status === 'pending').length, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div> : donations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <p style={{ color: '#6b7280', marginBottom: 16 }}>You haven't backed any projects yet.</p>
          <Link to="/" className="btn btn-primary">Browse Campaigns</Link>
        </div>
      ) : (
        <div className="card">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                {['Campaign', 'Amount', 'Date', 'Reward Tier', 'Status'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {donations.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <Link to={`/campaigns/${d.campaignId}`} style={{ fontWeight: 600, color: '#4f46e5', fontSize: 14 }}>
                      {d.campaign?.title || `Campaign #${d.campaignId}`}
                    </Link>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#22c55e' }}>${Number(d.amount).toFixed(2)}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>{d.rewardTierId ? `Tier #${d.rewardTierId}` : '—'}</td>
                  <td style={{ padding: '12px 16px' }}><span className={`badge badge-${d.status === 'completed' ? 'active' : d.status === 'failed' ? 'suspended' : 'pending'}`}>{d.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
