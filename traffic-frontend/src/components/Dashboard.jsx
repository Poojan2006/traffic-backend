import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axiosConfig';
import AnalyticsMap from './AnalyticsMap';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [violationList, setViolationList] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0, paid: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const verifyRes = await API.get('/auth/verify');
                const u = verifyRes.data.user;
                setUser(u);

                const endpoint = u.role === 'USER' ? '/violations/my' : '/violations/pending';
                const res = await API.get(endpoint);
                const list = res.data;
                setViolationList(list);
                setStats({
                    total: list.length,
                    pending: list.filter(v => v.status === 'PENDING').length,
                    verified: list.filter(v => v.status === 'VERIFIED').length,
                    paid: list.filter(v => v.status === 'PAID').length,
                });
            } catch (err) {
                console.error('Dashboard load error', err);
            }
        };
        load();
    }, []);

    if (!user) return <div className="loading" style={{ height: '100vh' }}>Loading...</div>;

    const isPolice = user.role !== 'USER';
    const primaryAction = isPolice ? { label: 'Issue Fine', path: '/issue-fine' } : { label: 'Report Violation', path: '/report' };

    const getBadge = (pts) => {
        const p = pts || 0;
        if (p >= 100) return { name: 'Gold Sentinel', icon: '🏆', color: '#ffb300' };
        if (p >= 50) return { name: 'Silver Guardian', icon: '🥈', color: '#9e9e9e' };
        if (p >= 20) return { name: 'Bronze Observer', icon: '🥉', color: '#cd7f32' };
        return { name: 'Rookie Reporter', icon: '🎖️', color: 'var(--primary)' };
    };

    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.7rem', fontWeight: 700, color: 'var(--text)' }}>
                    Hello, {user.username} 👋
                </h1>
                <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    {isPolice ? 'Traffic Enforcement Dashboard' : 'Civilian Reporting Dashboard'}
                </p>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                {[
                    { label: 'Total', value: stats.total, color: 'var(--text)' },
                    { label: 'Pending', value: stats.pending, color: 'var(--warning)' },
                    { label: 'Verified', value: stats.verified, color: 'var(--success)' },
                    { label: 'Paid', value: stats.paid, color: 'var(--primary)' },
                ].map(s => (
                    <div key={s.label} className="glass-card stat-card">
                        <span className="stat-value" style={{ color: s.color }}>{s.value}</span>
                        <span className="stat-label">{s.label}</span>
                    </div>
                ))}
            </div>

            {/* Content grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem', alignItems: 'start' }}>

                {/* Recent violations */}
                <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>
                            {isPolice ? 'Pending Validations' : 'My Recent Reports'}
                        </h3>
                        {isPolice && (
                            <button className="btn btn-secondary" style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }} onClick={() => navigate('/verify-reports')}>
                                View All
                            </button>
                        )}
                    </div>

                    {violationList.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            No records found.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {violationList.slice(0, 5).map(v => (
                                <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: 'var(--bg)' }}>
                                        <img src={`http://localhost:8080/api/violations/image/${v.id}`} alt="evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '0.88rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text)' }}>{v.description}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                            {v.vehicleNo ? `🚗 ${v.vehicleNo} · ` : ''}{new Date(v.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <span className={`status-badge ${v.status.toLowerCase()}`}>{v.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions & Badges */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {!isPolice && (
                        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ fontSize: '2.5rem' }}>{getBadge(user.points).icon}</div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Civic Rank</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: getBadge(user.points).color }}>{getBadge(user.points).name}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text)', marginTop: '0.25rem' }}>
                                    <span style={{ fontWeight: 700 }}>{user.points || 0}</span> / 100 XP
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="glass-card">
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text)' }}>Quick Actions</h3>
                        <button className="btn btn-primary" style={{ width: '100%', marginBottom: '0.75rem' }} onClick={() => navigate(primaryAction.path)}>
                            {primaryAction.label}
                        </button>
                        {!isPolice && (
                            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => navigate('/check-challan')}>
                                Check Challan
                            </button>
                        )}
                        {isPolice && (
                            <>
                                <button className="btn btn-secondary" style={{ width: '100%', marginBottom: '0.75rem' }} onClick={() => navigate('/verify-reports')}>
                                    Verify Reports
                                </button>
                                <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => navigate('/my-violations')}>
                                    My Issued Fines
                                </button>
                            </>
                        )}
                    </div>

                    <div className="glass-card" style={{ padding: '1.25rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>AI POWERED</div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-sub)', lineHeight: 1.6 }}>
                            Upload evidence photos to get AI-powered violation analysis and recommended challan amounts.
                        </p>
                    </div>

                    <div className="glass-card" style={{ padding: 0 }}>
                        <div style={{ padding: '1rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>
                                {isPolice ? 'Violation Heatmap' : 'My Reporting Heatmap'}
                            </h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                                {isPolice ? 'Geospatial concentration of offenses.' : 'Geospatial view of your submitted reports.'}
                            </p>
                        </div>
                        <AnalyticsMap violations={violationList} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
