import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const ROLE_META = {
    USER:   { label: 'Civilian Portal',    icon: '👤', badge: '#4f6ef7', bg: 'rgba(79,110,247,0.1)' },
    POLICE: { label: 'Police Dashboard',   icon: '🚔', badge: '#d97706', bg: 'rgba(217,119,6,0.1)'  },
    ADMIN:  { label: 'Admin Control Panel',icon: '🛡️', badge: '#9f46e4', bg: 'rgba(159,70,228,0.1)' },
};

const Sidebar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role || 'USER';
    const meta = ROLE_META[role] || ROLE_META.USER;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navItem = (to, icon, label) => (
        <NavLink to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <div className="icon-wrapper">{icon}</div>
            {label}
        </NavLink>
    );

    return (
        <aside className="sidebar">
            {/* Brand */}
            <div className="sidebar-logo">
                <div className="logo-icon">🚦</div>
                <span>Trivo</span>
            </div>

            {/* Role Identity Banner */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                background: meta.bg, border: `1px solid ${meta.badge}30`,
                borderRadius: 6, padding: '0.6rem 0.75rem',
                marginBottom: '1.5rem'
            }}>
                <span style={{ fontSize: '1.1rem' }}>{meta.icon}</span>
                <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: meta.badge, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{role}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', fontWeight: 500 }}>{meta.label}</div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="nav-links">
                {navItem('/dashboard', '⊞', 'Dashboard')}

                {/* Civilian */}
                {role === 'USER' && navItem('/report', '＋', 'Report Violation')}
                {role === 'USER' && navItem('/check-challan', '🔍', 'Check Challan')}
                {role === 'USER' && navItem('/my-violations', '📄', 'My Reports')}

                {/* Police */}
                {role === 'POLICE' && navItem('/issue-fine', '⚖', 'Issue Fine')}
                {role === 'POLICE' && navItem('/verify-reports', '✓', 'Verify Reports')}
                {role === 'POLICE' && navItem('/my-violations', '📄', 'My Issued Fines')}

                {/* Admin */}
                {role === 'ADMIN' && navItem('/issue-fine', '⚖', 'Issue Fine')}
                {role === 'ADMIN' && navItem('/admin', '👥', 'Manage Users')}
                {role === 'ADMIN' && navItem('/verify-reports', '✓', 'Verify Reports')}
                {role === 'ADMIN' && navItem('/my-violations', '📄', 'All Issued Fines')}
            </nav>

            {/* User Info + Logout */}
            <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ marginBottom: '0.85rem' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{user.username || 'User'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                </div>
                <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', fontSize: '0.85rem' }}>
                    Sign out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
