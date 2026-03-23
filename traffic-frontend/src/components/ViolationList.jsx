import React, { useState, useEffect, useCallback } from 'react';
import API from '../api/axiosConfig';
import { generateChallanPDF } from '../utils/pdfGenerator';

const ViolationList = ({ role: propRole, type = 'my', onActionSuccess }) => {
    const [violations, setViolations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [verifyingId, setVerifyingId] = useState(null);
    const [fineDetails, setFineDetails] = useState({ fineAmount: '', vehicleNo: '' });

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = propRole || user.role || 'USER';

    const fetchViolations = useCallback(async () => {
        try {
            // "type=my" fetches user's own reports. But for Police/Admin, "My Issued Fines" should fetch all verified ones in the city
            let endpoint = '/violations/my';
            if (type === 'pending') endpoint = '/violations/pending';
            else if (role !== 'USER') endpoint = '/violations/issued'; // Police sees all issued fines
            
            const res = await API.get(endpoint);
            setViolations(res.data);
        } catch (err) {
            console.error('Fetch violations failed', err);
        } finally {
            setLoading(false);
        }
    }, [role, type]);

    useEffect(() => { fetchViolations(); }, [fetchViolations]);

    const handleVerify = async (id, action) => {
        try {
            await API.put(`/violations/verify/${id}`, { ...fineDetails, action });
            setVerifyingId(null);
            setFineDetails({ fineAmount: '', vehicleNo: '' });
            fetchViolations();
            if (onActionSuccess) onActionSuccess();
        } catch (err) {
            alert('Verification failed. Please check the details.');
        }
    };

    if (loading) return <div className="loading" style={{ padding: '4rem', width: '100%' }}>Loading records...</div>;

    const isPolice = role !== 'USER';

    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.7rem', fontWeight: 700 }}>
                    {type === 'pending' ? 'Verify Reports' : (isPolice ? 'My Issued Fines' : 'My Reports')}
                </h1>
                <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    {type === 'pending' ? 'Review incoming civilian reports and issue challans.' : (isPolice ? 'Fines you have successfully verified and issued.' : 'All violations you have reported.')}
                </p>
            </div>

            {violations.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.75rem', opacity: 0.3 }}>📂</div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No records found.</p>
                </div>
            ) : (
                <div className="violation-grid">
                    {violations.map(v => (
                        <div key={v.id} className="glass-card violation-card">
                            <div className="image-container">
                                <img src={`http://localhost:8080/api/violations/image/${v.id}`} alt="Evidence" />
                                <span className={`status-badge ${v.status.toLowerCase()}`}>{v.status}</span>
                            </div>

                            <div style={{ padding: '1.25rem' }}>
                                <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', lineHeight: 1.4 }}>{v.description}</p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                    {v.vehicleNo && (
                                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-sub)', letterSpacing: '0.08em' }}>🚗 {v.vehicleNo}</span>
                                    )}
                                    {v.location && <span>📍 {v.location}</span>}
                                    <span>📅 {new Date(v.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                                </div>

                                {v.fineAmount && (
                                    <div style={{ padding: '0.75rem', background: 'var(--success-dim)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>Fine Amount</span>
                                        <span style={{ fontWeight: 700, color: 'var(--success)' }}>₹{v.fineAmount}</span>
                                    </div>
                                )}

                                {(v.status === 'VERIFIED' || v.status === 'PAID') && (
                                    <button 
                                        onClick={() => generateChallanPDF(v)}
                                        className="btn btn-secondary" 
                                        style={{ width: '100%', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                        <span>📄</span> Download Official Challan
                                    </button>
                                )}

                                {isPolice && v.status === 'PENDING' && (
                                    verifyingId === v.id ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label>Vehicle No.</label>
                                                <input type="text" placeholder="MH-01-AB-1234"
                                                    value={fineDetails.vehicleNo}
                                                    onChange={(e) => setFineDetails({ ...fineDetails, vehicleNo: e.target.value.toUpperCase() })} />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label>Fine Amount (₹)</label>
                                                <input type="number" placeholder="1000"
                                                    value={fineDetails.fineAmount}
                                                    onChange={(e) => setFineDetails({ ...fineDetails, fineAmount: e.target.value })} />
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => handleVerify(v.id, 'APPROVE')} className="btn btn-primary" style={{ flex: 1, fontSize: '0.85rem' }}
                                                    disabled={!fineDetails.fineAmount || !fineDetails.vehicleNo}>
                                                    Issue Challan
                                                </button>
                                                <button onClick={() => handleVerify(v.id, 'REJECT')} className="btn btn-secondary"
                                                    style={{ flex: 1, fontSize: '0.85rem', color: 'var(--danger)', borderColor: 'rgba(224,82,82,0.3)' }}>
                                                    Reject
                                                </button>
                                            </div>
                                            <button onClick={() => setVerifyingId(null)} className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem' }}>
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button onClick={() => { setVerifyingId(v.id); setFineDetails({ fineAmount: '', vehicleNo: v.vehicleNo || '' }); }}
                                            className="btn btn-primary" style={{ width: '100%', fontSize: '0.85rem' }}>
                                            Process Violation
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ViolationList;
