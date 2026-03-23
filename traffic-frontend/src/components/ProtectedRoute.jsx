import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import API from '../api/axiosConfig';

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsAuthenticated(false);
                return;
            }
            try {
                await API.get('/auth/verify');
                setIsAuthenticated(true);
            } catch {
                localStorage.removeItem('token');
                setIsAuthenticated(false);
            }
        };
        verifyToken();
    }, []);

    if (isAuthenticated === null) return <div className="loading">Verifying access...</div>;

    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
