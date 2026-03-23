import React, { useState } from 'react';
import API from '../api/axiosConfig';

const UploadImage = ({ userId, onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await API.post(`/users/upload/${userId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Image uploaded successfully!');
            onUploadSuccess();
        } catch (err) {
            console.error('Upload failed', err);
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="upload-container">
            <h4>Upload Profile Image</h4>
            <input type="file" onChange={handleFileChange} accept="image/*" />
            <button 
                onClick={handleUpload} 
                disabled={!file || uploading}
                className="secondary-btn"
            >
                {uploading ? 'Uploading...' : 'Upload'}
            </button>
        </div>
    );
};

export default UploadImage;
