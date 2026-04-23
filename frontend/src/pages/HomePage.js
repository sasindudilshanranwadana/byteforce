import React, { useState, useEffect } from 'react';
import CampaignCard from '../components/CampaignCard';
import api from '../services/api';

const CATEGORIES = ['All', 'Technology', 'Art', 'Music', 'Film', 'Food', 'Health', 'Education', 'Community', 'General'];

export default function HomePage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 12 };
        if (search) params.search = search;
        if (category !== 'All') params.category = category;
        const res = await api.get('/campaigns', { params });
        setCampaigns(res.data.campaigns);
        setTotalPages(res.data.totalPages);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchCampaigns();
  }, [search, category, page]);

  return (
    <div>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', padding: '60px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 42, fontWeight: 800, marginBottom: 16 }}>Fund Ideas That Matter</h1>
        <p style={{ fontSize: 18, opacity: 0.9, marginBottom: 32, maxWidth: 540, margin: '0 auto 32px' }}>
          Back creative projects, support startups, and make a difference.
        </p>
        <div style={{ display: 'flex', maxWidth: 560, margin: '0 auto', gap: 12 }}>
          <input style={{ flex: 1, padding: '14px 18px', borderRadius: 8, border: 'none', fontSize: 15 }}
            placeholder="Search campaigns..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px' }}>
        {/* Category filter */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 32 }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => { setCategory(cat); setPage(1); }}
              className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-secondary'}`}>{cat}</button>
          ))}
        </div>

        {/* Campaign grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
            <p style={{ fontSize: 18 }}>No campaigns found.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {campaigns.map(c => <CampaignCard key={c.id} campaign={c} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
            <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span style={{ padding: '6px 12px', fontSize: 14 }}>{page} / {totalPages}</span>
            <button className="btn btn-secondary btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
