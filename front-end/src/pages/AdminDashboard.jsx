import React, { useState, useEffect } from 'react';
import { adminService } from '../api/adminService';
import toast from 'react-hot-toast';
import '../styles/Admin.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);

    const availableYears = Array.from({ length: 10 }, (_, i) => currentYear - i);

    useEffect(() => {
        loadDashboardStats();
    }, [selectedYear]);

    const loadDashboardStats = async () => {
        try {
            setLoading(true);
            const response = await adminService.getDashboardStats(selectedYear);
            setStats(response.data);
        } catch (error) {
            toast.error('Failed to load dashboard stats');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="admin-dashboard admin-loading">Loading...</div>;
    }

    if (!stats) {
        return <div className="admin-dashboard admin-error">Failed to load statistics</div>;
    }

    const StatCard = ({ title, value, color }) => (
        <div className={`stat-card stat-card-${color}`}>
            <div className="stat-title">{title}</div>
            <div className="stat-value">{value}</div>
        </div>
    );

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <button className="refresh-btn" onClick={loadDashboardStats}>
                    Refresh
                </button>
            </div>

            <div className="dashboard-grid">
                <StatCard title="Approved" value={stats.totalApproved} color="success" />
                <StatCard title="Blocked" value={stats.totalBlocked} color="danger" />
                <StatCard title="Reviewing" value={stats.totalReviewing} color="warning" />
                <StatCard title="Total Posts" value={stats.totalPosts} color="primary" />
                <StatCard title="Total Users" value={stats.totalUsers} color="secondary" />
            </div>

            <div className="dashboard-charts" style={{ marginTop: '20px', marginBottom: '20px' }}>
                <div className="info-card" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3>New User Statistics By Year</h3>
                        
                        <select 
                            value={selectedYear} 
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none' }}
                        >
                            {availableYears.map(year => (
                                <option key={year} value={year}>Year: {year}</option>
                            ))}
                        </select>
                    </div>

                    {stats.monthlyUsers && stats.monthlyUsers.length > 0 ? (
                        <div className="monthly-stats-container" style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '220px', marginTop: '30px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                            {stats.monthlyUsers.map((item, index) => {
                                const maxUsers = Math.max(...stats.monthlyUsers.map(d => d.count));
                                // Tối thiểu cột cao 5% để dễ nhìn kể cả khi count = 0
                                const heightPercentage = maxUsers > 0 ? Math.max((item.count / maxUsers) * 100, 5) : 5; 
                                
                                return (
                                    <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                                        <span style={{ fontSize: '12px', marginBottom: '5px', fontWeight: 'bold', color: item.count > 0 ? '#1e293b' : '#94a3b8' }}>
                                            {item.count}
                                        </span>
                                        <div 
                                            style={{ 
                                                height: `${heightPercentage}%`, 
                                                width: '100%',
                                                maxWidth: '45px',
                                                backgroundColor: item.count > 0 ? '#3b82f6' : '#e2e8f0', 
                                                borderRadius: '4px 4px 0 0',
                                                transition: 'all 0.4s ease'
                                            }}
                                            title={`${item.count} người dùng trong tháng ${index + 1}`}
                                        ></div>
                                        <span style={{ fontSize: '12px', marginTop: '10px', color: '#64748b', whiteSpace: 'nowrap' }}>
                                            {item.month}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p style={{ color: '#64748b', marginTop: '10px' }}>Don't have stats in year {selectedYear}.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
