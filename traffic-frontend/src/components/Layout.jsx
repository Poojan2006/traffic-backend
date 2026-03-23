import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role || 'USER';
    return (
        <div className="app-root" data-role={role}>
            <Sidebar />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

export default Layout;
