import React, { useState } from 'react';
import API from '../api/axiosConfig';
import { generateChallanPDF } from '../utils/pdfGenerator';

const CheckChallan = () => {
    const [vehicleNo, setVehicleNo] = useState('');
    const [violations, setViolations] = useState(null);
    const [loading, setLoading] = useState(false);
    const [payingId, setPayingId] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await API.get(`/violations/vehicle/${vehicleNo.trim().toUpperCase()}`);
            setViolations(res.data);
        } catch (err) {
            setViolations([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePay = async (id) => {
        setPayingId(id);
        try {
            const res = await API.put(`/violations/${id}/pay`);
            setViolations(prev => prev.map(v => v.id === id ? res.data : v));
        } catch {
            alert('Payment failed. Please try again.');
        } finally {
            setPayingId(null);
        }
    };

    return (
        <div style={{ maxWidth: 720, animation: 'fadeIn 0.3s ease' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.7rem', fontWeight: 700 }}>Check Challan</h1>
                <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Enter your vehicle number to view and pay pending challans.</p>
            </div>

            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <input
                    type="text"
                    placeholder="e.g. KA-01-AB-1234"
                    value={vehicleNo}
                    onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                    required
                    style={{ flex: 1, letterSpacing: '0.06em', fontWeight: 600 }}
                />
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? '...' : 'Search'}
                </button>
            </form>

            {violations === null && (
                <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Enter a vehicle registration number above to search for challans.
                </div>
            )}

            {violations !== null && violations.length === 0 && (
                <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>✓</div>
                    <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem' }}>No challans found for <strong style={{ color: 'var(--text)' }}>{vehicleNo}</strong>.</p>
                </div>
            )}

            {violations && violations.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {violations.map(v => (
                        <div key={v.id} className="glass-card" style={{ display: 'flex', gap: '1.25rem', padding: '1.25rem' }}>
                            <div style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'var(--bg)' }}>
                                <img src={`http://localhost:8080/api/violations/image/${v.id}`} alt="Evidence"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 600, flex: 1, marginRight: '1rem' }}>{v.description}</p>
                                    <span className={`status-badge ${v.status.toLowerCase()}`} style={{ position: 'static', flexShrink: 0 }}>{v.status}</span>
                                </div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                                    📅 {new Date(v.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                                    {v.location ? ` · 📍 ${v.location}` : ''}
                                </div>
                                {v.fineAmount && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: v.status === 'PAID' ? 'var(--success)' : 'var(--warning)' }}>
                                            ₹{v.fineAmount}
                                        </span>
                                        {v.status === 'VERIFIED' && (
                                            <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}
                                                onClick={() => handlePay(v.id)} disabled={payingId === v.id}>
                                                {payingId === v.id ? 'Processing...' : 'Pay Now'}
                                            </button>
                                        )}
                                        {v.status === 'PAID' && (
                                            <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>✓ Paid</span>
                                        )}
                                        
                                        {(v.status === 'VERIFIED' || v.status === 'PAID') && (
                                            <button 
                                                onClick={() => generateChallanPDF(v)}
                                                className="btn btn-secondary" 
                                                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', background: 'var(--bg-input)' }}>
                                                <span>📄</span> Download Official PDF
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CheckChallan;
