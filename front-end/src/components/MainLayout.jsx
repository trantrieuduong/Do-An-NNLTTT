import React from 'react';
import Sidebar from './Sidebar';
import '../styles/Layout.css';

const MainLayout = ({ children }) => {
    return (
        <div className="layout-container">
            <Sidebar />
            <main className="layout-content">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
