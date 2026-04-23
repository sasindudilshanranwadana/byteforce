import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const styles = {
  nav: { background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 24px', position: 'sticky', top: 0, zIndex: 100 },
  inner: { maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 },
  logo: { fontSize: 20, fontWeight: 700, color: '#4f46e5' },
  links: { display: 'flex', alignItems: 'center', gap: 24 },
  link: { fontSize: 14, fontWeight: 500, color: '#374151' },
  userInfo: { fontSize: 13, color: '#6b7280' },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <Link to="/" style={styles.logo}>⚡ Byteforce</Link>
        <div style={styles.links}>
          <Link to="/" style={styles.link}>Browse</Link>
          {user ? (
            <>
              {user.role === 'campaigner' && <Link to="/create" style={styles.link}>Create Campaign</Link>}
              {user.role === 'campaigner' && <Link to="/dashboard/campaigner" style={styles.link}>My Campaigns</Link>}
              {user.role === 'backer' && <Link to="/dashboard/backer" style={styles.link}>My Donations</Link>}
              {user.role === 'admin' && <Link to="/admin" style={styles.link}>Admin</Link>}
              <span style={styles.userInfo}>Hi, {user.name}</span>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.link}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
