import React, { useState, useEffect, useCallback } from 'react';
import API from '../api/axiosConfig';

const AdminPanel = () => {
    const [form, setForm] = useState({ username: '', email: '', password: '', role: 'POLICE' });
    const [userList, setUserList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const fetchUsers = useCallback(async () => {
        try {
            const res = await API.get('/users');
            setUserList(res.data.filter(u => u.role !== 'ADMIN'));
        } catch (err) {
            console.error('Failed to load users', err);
        }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleGenerateCredentials = () => {
        const id = `POLICE-${Math.floor(1000 + Math.random() * 9000)}`;
        setForm({
            ...form,
            username: `Officer ${id}`,
            email: `${id.toLowerCase()}@trivo.com`,
            password: `Trv@${Math.floor(10000 + Math.random() * 90000)}`,
            role: 'POLICE'
        });
        setShowPassword(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(''); setSuccess('');
        try {
            await API.post('/admin/register-user', { ...form });
            setSuccess(`${form.role} user "${form.username}" registered.`);
            setForm({ username: '', email: '', password: '', role: 'POLICE' });
            setShowPassword(false);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Remove user "${name}" from the system?`)) return;
        try {
            await API.delete(`/users/${id}`);
            fetchUsers();
        } catch {
            alert('Failed to delete user.');
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.7rem', fontWeight: 700 }}>Manage Users</h1>
                <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Register officers and manage all system users.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.5rem', alignItems: 'start' }}>

                {/* Register Form */}
                <div className="glass-card">
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Register New User</h3>

                    {success && (
                        <div style={{ background: 'var(--success-dim)', border: '1px solid rgba(62,207,142,0.25)', color: 'var(--success)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                            ✓ {success}
                        </div>
                    )}
                    {error && (
                        <div style={{ background: 'var(--danger-dim)', border: '1px solid rgba(224,82,82,0.25)', color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Role</label>
                            <select name="role" value={form.role} onChange={(e) => { handleChange(e); setShowPassword(false); }}>
                                <option value="POLICE">Police Officer</option>
                                <option value="USER">Civilian User</option>
                            </select>
                        </div>

                        {form.role === 'POLICE' && (
                            <button type="button" className="btn btn-secondary" onClick={handleGenerateCredentials}
                                style={{ fontSize: '0.85rem', color: 'var(--warning)', borderColor: 'rgba(245,158,11,0.3)', background: 'var(--warning-dim)' }}>
                                ✦ Auto-Generate Police ID
                            </button>
                        )}

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Full Name</label>
                            <input type="text" name="username" value={form.username} placeholder="Full name" onChange={handleChange} required />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>{form.role === 'POLICE' ? 'Police ID / Email' : 'Email'}</label>
                            <input type="email" name="email" value={form.email} placeholder="user@domain.com" onChange={handleChange} required />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Password{showPassword ? ' (copy before submitting)' : ''}</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showPassword ? 'text' : 'password'} name="password" value={form.password}
                                    placeholder="Set a password" onChange={handleChange} required
                                    style={showPassword ? { borderColor: 'var(--warning)', fontFamily: 'monospace' } : {}} />
                                {showPassword && (
                                    <span onClick={() => setShowPassword(false)}
                                        style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '1rem', color: 'var(--text-muted)' }}>
                                        👁
                                    </span>
                                )}
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Registering...' : 'Register User'}
                        </button>
                    </form>
                </div>

                {/* User List */}
                <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Active Directory</h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '0.2rem 0.6rem', borderRadius: 4 }}>{userList.length} users</span>
                    </div>

                    {userList.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No users registered yet.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {userList.map(u => (
                                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 8, background: u.role === 'POLICE' ? 'var(--warning-dim)' : 'var(--primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                                        {u.role === 'POLICE' ? '🚔' : '👤'}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{u.username}</span>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: u.role === 'POLICE' ? 'var(--warning)' : 'var(--primary)', background: u.role === 'POLICE' ? 'var(--warning-dim)' : 'var(--primary-dim)', padding: '1px 6px', borderRadius: 3, textTransform: 'uppercase' }}>{u.role}</span>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                                    </div>
                                    <button onClick={() => handleDelete(u.id, u.username)}
                                        style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.65rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
