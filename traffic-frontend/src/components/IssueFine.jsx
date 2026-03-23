import React, { useState } from 'react';
import API from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

const IssueFine = () => {
    const [form, setForm] = useState({ vehicleNo: '', description: '', fineAmount: '', location: '' });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const navigate = useNavigate();

    const handleAnalyze = async () => {
        if (!image) return;
        setAnalyzing(true);
        const formData = new FormData();
        formData.append('image', image);
        try {
            const res = await API.post('/violations/analyze', formData);
            const data = res.data;
            setForm(prev => ({ ...prev, description: data.description, fineAmount: data.recommendedFine }));
        } catch (err) {
            alert('AI analysis failed.');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => setForm(prev => ({ ...prev, location: `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}` })),
                    () => {}
                );
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image) { alert('Please upload a photo.'); return; }
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('vehicleNo', form.vehicleNo);
            fd.append('description', form.description);
            fd.append('fineAmount', form.fineAmount);
            fd.append('location', form.location);
            fd.append('image', image);
            await API.post('/violations/issue-fine', fd);
            setSuccess(true);
        } catch (err) {
            alert('Failed to issue fine.');
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1.25rem', animation: 'fadeIn 0.3s ease' }}>
                <div style={{ width: 56, height: 56, background: 'var(--success-dim)', border: '1px solid var(--success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>✓</div>
                <h2 style={{ fontSize: '1.4rem' }}>Fine Issued</h2>
                <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem' }}>Case for <strong style={{ color: 'var(--text)' }}>{form.vehicleNo}</strong> has been recorded.</p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-primary" onClick={() => { setSuccess(false); setForm({ vehicleNo: '', description: '', fineAmount: '', location: '' }); setImage(null); setPreview(null); }}>Issue Another</button>
                    <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Dashboard</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 720, animation: 'fadeIn 0.3s ease' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.7rem', fontWeight: 700 }}>Issue Fine</h1>
                <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Document a traffic violation and issue an official challan.</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Vehicle Registration No.</label>
                        <input type="text" name="vehicleNo" placeholder="KA-01-AB-1234" value={form.vehicleNo}
                            onChange={handleChange} required style={{ letterSpacing: '0.06em', fontWeight: 600 }} />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Evidence Photo</label>
                        <div
                            onClick={() => document.getElementById('fine-img').click()}
                            style={{
                                height: 220, border: '1.5px dashed var(--border-active)',
                                borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', cursor: 'pointer', overflow: 'hidden',
                                background: 'var(--bg-input)', transition: 'border-color 0.2s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-active)'}
                        >
                            {preview ? (
                                <img src={preview} alt="Evidence" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
                                    <p style={{ fontSize: '0.85rem' }}>Click to capture evidence</p>
                                </div>
                            )}
                            <input id="fine-img" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Location</label>
                        <input type="text" name="location" value={form.location}
                            onChange={handleChange} placeholder="Auto-detected or type manually" />
                    </div>

                    {image && (
                        <button type="button" className="btn btn-secondary" onClick={handleAnalyze} disabled={analyzing}>
                            {analyzing ? 'Analyzing...' : '✦ Run AI Violation Scan'}
                        </button>
                    )}

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Violation Description</label>
                        <textarea name="description" rows={4} placeholder="Describe the observed violation..." value={form.description}
                            onChange={handleChange} required style={{ resize: 'vertical' }} />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Fine Amount (₹)</label>
                        <input type="number" name="fineAmount" placeholder="e.g. 1000" value={form.fineAmount}
                            onChange={handleChange} required min="1" />
                    </div>

                    {(form.vehicleNo || form.fineAmount) && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>{form.vehicleNo || '—'}</span>
                            {form.fineAmount && <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--warning)' }}>₹{form.fineAmount}</span>}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? 'Issuing...' : 'Issue Official Fine'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default IssueFine;
