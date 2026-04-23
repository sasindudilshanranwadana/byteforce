import React, { useState, useEffect } from 'react';
import api from '../services/api';

const STATUS_FILTERS = ['all', 'pending', 'active', 'suspended', 'rejected'];

export default function AdminDashboardPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState({});
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [campRes, statsRes] = await Promise.all([
        api.get('/admin/campaigns', { params: filter !== 'all' ? { status: filter } : {} }),
        api.get('/admin/stats'),
      ]);
      setCampaigns(campRes.data);
      setStats(statsRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [filter]);

  const moderate = async (id, action) => {
    setActionLoading(id + action);
    try {
      await api.put(`/admin/campaigns/${id}/moderate`, { action });
      fetchData();
    } catch (err) { alert('Action failed: ' + (err.response?.data?.message || err.message)); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Admin Dashboard</h1>
      <p style={{ color: '#6b7280', marginBottom: 32 }}>Manage campaigns and platform operations</p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Campaigns', value: stats.totalCampaigns || 0, color: '#4f46e5' },
          { label: 'Pending Review', value: stats.pendingCampaigns || 0, color: '#f59e0b' },
          { label: 'Total Donations', value: stats.totalDonations || 0, color: '#22c55e' },
          { label: 'Total Raised', value: `$${Number(stats.totalRaised || 0).toLocaleString()}`, color: '#06b6d4' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {STATUS_FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            style={{ textTransform: 'capitalize' }}>{f}</button>
        ))}
      </div>

      {/* Campaigns table */}
      {loading ? <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div> : (
        <div className="card">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                {['Campaign', 'Creator', 'Goal', 'Raised', 'Deadline', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#374151' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#6b7280' }}>No campaigns found.</td></tr>
              ) : campaigns.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, fontSize: 14, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{c.category}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>{c.creator?.name}<br/><span style={{ color: '#9ca3af', fontSize: 11 }}>{c.creator?.email}</span></td>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>${Number(c.goalAmount).toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>
                    <div style={{ color: '#22c55e', fontWeight: 600 }}>${Number(c.raisedAmount).toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{c.progress}%</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>{c.deadline}</td>
                  <td style={{ padding: '12px 16px' }}><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {c.status === 'pending' && <button onClick={() => moderate(c.id, 'approve')} className="btn btn-success btn-sm" disabled={!!actionLoading}>✓ Approve</button>}
                      {c.status === 'pending' && <button onClick={() => moderate(c.id, 'reject')} className="btn btn-danger btn-sm" disabled={!!actionLoading}>✗ Reject</button>}
                      {c.status === 'active' && <button onClick={() => moderate(c.id, 'suspend')} className="btn btn-secondary btn-sm" disabled={!!actionLoading}>⏸ Suspend</button>}
                      {c.status === 'suspended' && <button onClick={() => moderate(c.id, 'approve')} className="btn btn-success btn-sm" disabled={!!actionLoading}>▶ Reinstate</button>}
                      {c.status !== 'closed' && <button onClick={() => moderate(c.id, 'remove')} className="btn btn-danger btn-sm" disabled={!!actionLoading}>🗑 Remove</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
