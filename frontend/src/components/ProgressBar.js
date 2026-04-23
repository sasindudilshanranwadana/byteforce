import React from 'react';

export default function ProgressBar({ raised, goal, showLabels = true }) {
  const pct = Math.min(100, ((raised / goal) * 100)).toFixed(1);
  return (
    <div style={{ width: '100%' }}>
      <div style={{ background: '#e2e8f0', borderRadius: 999, height: 10, overflow: 'hidden', margin: '8px 0' }}>
        <div style={{ width: `${pct}%`, background: pct >= 100 ? '#22c55e' : '#4f46e5', height: '100%', borderRadius: 999, transition: 'width 0.4s' }} />
      </div>
      {showLabels && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280' }}>
          <span><strong style={{ color: '#1e293b' }}>${Number(raised).toLocaleString()}</strong> raised</span>
          <span><strong style={{ color: '#4f46e5' }}>{pct}%</strong> of ${Number(goal).toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
