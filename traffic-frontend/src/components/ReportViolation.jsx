import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axiosConfig';

const ReportViolation = ({ onReportSuccess }) => {
    const [description, setDescription] = useState('');
    const [vehicleNo, setVehicleNo] = useState('');
    const [image, setImage] = useState(null);
    const [location, setLocation] = useState('');
    const [recommendedFine, setRecommendedFine] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [preview, setPreview] = useState(null);
    const navigate = useNavigate();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => setLocation(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`),
                    () => setLocation('Location unavailable')
                );
            }
        }
    };

    const handleAnalyze = async () => {
        if (!image) return;
        setAnalyzing(true);
        const formData = new FormData();
        formData.append('image', image);
        try {
            const res = await API.post('/violations/analyze', formData);
            setDescription(res.data.description);
            setRecommendedFine(res.data.recommendedFine);
        } catch (err) {
            console.error(err);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('description', description);
        formData.append('vehicleNo', vehicleNo);
        formData.append('image', image);
        formData.append('location', location);
        try {
            await API.post('/violations/report', formData);
            if (onReportSuccess) onReportSuccess();
            navigate('/my-violations');
        } catch (err) {
            console.error('Report submission error:', err.response?.status, err.response?.data);
            alert('Could not submit the report. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ maxWidth: 720, animation: 'fadeIn 0.3s ease' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.7rem', fontWeight: 700 }}>Report Violation</h1>
                <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Submit evidence of a traffic violation for police review.</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    {/* Vehicle Number */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Vehicle Registration No.</label>
                        <input type="text" placeholder="KA-01-AB-1234" value={vehicleNo}
                            onChange={(e) => setVehicleNo(e.target.value.toUpperCase())} required
                            style={{ letterSpacing: '0.06em', fontWeight: 600 }} />
                    </div>

                    {/* Photo Upload */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Evidence Photo</label>
                        <div
                            onClick={() => document.getElementById('report-img').click()}
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
                                <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
                                    <p style={{ fontSize: '0.85rem' }}>Click to upload photo</p>
                                    <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-muted)' }}>JPG, PNG, WEBP</p>
                                </div>
                            )}
                            <input id="report-img" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} required />
                        </div>
                    </div>

                    {/* Location */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Location</label>
                        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                            placeholder="Auto-detected from GPS or type manually" />
                    </div>

                    {/* AI Scan */}
                    {image && (
                        <button type="button" className="btn btn-secondary" onClick={handleAnalyze} disabled={analyzing}>
                            {analyzing ? 'Analyzing...' : '✦ Run AI Analysis'}
                        </button>
                    )}

                    {/* AI Result */}
                    {recommendedFine !== null && (
                        <div className="ai-insight">
                            <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.6, marginBottom: '0.75rem' }}>{description}</p>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                                Recommended fine: <strong style={{ color: 'var(--success)', fontSize: '1rem' }}>₹{recommendedFine}</strong>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Description</label>
                        <textarea placeholder="Describe the violation..." value={description}
                            onChange={(e) => setDescription(e.target.value)} rows={4} required style={{ resize: 'vertical' }} />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={uploading}>
                        {uploading ? 'Submitting...' : 'Submit Report'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReportViolation;
