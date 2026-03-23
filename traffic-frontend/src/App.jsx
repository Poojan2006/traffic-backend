import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ReportViolation from './components/ReportViolation';
import IssueFine from './components/IssueFine';
import AdminPanel from './components/AdminPanel';
import ViolationList from './components/ViolationList';
import CheckChallan from './components/CheckChallan';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import './index.css';

function App() {
    return (
        <Router>
            <Routes>
                {/* Auth Routes (No Sidebar) */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Civilian: Report Violation */}
                <Route 
                    path="/report" 
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <ReportViolation />
                            </Layout>
                        </ProtectedRoute>
                    } 
                />

                {/* Police / Admin: Issue Fine */}
                <Route 
                    path="/issue-fine" 
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <IssueFine />
                            </Layout>
                        </ProtectedRoute>
                    } 
                />

                {/* Admin: Manage Officers */}
                <Route 
                    path="/admin" 
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <AdminPanel />
                            </Layout>
                        </ProtectedRoute>
                    } 
                />

                {/* Dashboard */}
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Dashboard />
                            </Layout>
                        </ProtectedRoute>
                    } 
                />

                {/* Violations lists */}
                <Route 
                    path="/my-violations" 
                    element={<ProtectedRoute><Layout><ViolationList type="my" /></Layout></ProtectedRoute>} 
                />
                <Route 
                    path="/verify-reports" 
                    element={<ProtectedRoute><Layout><ViolationList type="pending" /></Layout></ProtectedRoute>} 
                />

                {/* Check Challan */}
                <Route
                    path="/check-challan"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <CheckChallan />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                
                {/* Fallback */}
                <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
        </Router>
    );
}

export default App;
