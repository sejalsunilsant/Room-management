import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Shield } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="glass-panel" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 32px',
      margin: '20px 20px 0 20px',
      borderRadius: 'var(--radius-md)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img 
          src="/logo.jpeg" 
          alt="ST Rooms Logo" 
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 0 15px rgba(255, 255, 255, 0.25)'
          }} 
        />
        <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.5px' }}>
          ST <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>ROOMS</span>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
          {user.role === 'ROLE_ADMIN' ? <Shield size={16} style={{ color: 'var(--warning)' }} /> : <User size={16} />}
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
            {user.username} 
            <span style={{ 
              fontSize: '0.75rem', 
              marginLeft: '6px', 
              padding: '2px 8px', 
              borderRadius: '4px',
              border: user.role === 'ROLE_ADMIN' ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid rgba(255, 255, 255, 0.2)',
              background: user.role === 'ROLE_ADMIN' ? 'var(--warning-glow)' : 'rgba(255, 255, 255, 0.08)',
              color: user.role === 'ROLE_ADMIN' ? 'var(--warning)' : 'var(--text-primary)'
            }}>
              {user.role.replace('ROLE_', '')}
            </span>
          </span>
        </div>

        <button 
          onClick={logout} 
          className="btn btn-secondary" 
          style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </nav>
  );
};
