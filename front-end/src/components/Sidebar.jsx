import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, MessageCircle, Users, User, ShieldCheck, LogOut } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useNotification } from '../context/NotificationContext';
import NotificationPanel from './notification/NotificationPanel';
import '../styles/Layout.css';

const Sidebar = () => {
    const navigate = useNavigate();
    const { unreadCount, disconnect } = useChat();
    const { clearNotifications } = useNotification();

    const handleLogout = () => {
        disconnect();
        clearNotifications();
        localStorage.removeItem('token');
        navigate('/login');
    };

    const navItems = [
        { to: '/', icon: <Home size={20} />, label: 'Home', exact: true },
        { to: '/chat', icon: <MessageCircle size={20} />, label: 'Messages', badge: unreadCount },
        { to: '/friends', icon: <Users size={20} />, label: 'Friends' },
        { to: '/my-profile', icon: <User size={20} />, label: 'Profile' },
        { to: '/security', icon: <ShieldCheck size={20} />, label: 'Security' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <span>✦</span>
                <span>OkayJi</span>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.exact}
                        className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                        {item.badge > 0 && (
                            <span className="nav-badge">{item.badge > 99 ? '99+' : item.badge}</span>
                        )}
                    </NavLink>
                ))}

                {/* Notification panel embedded as a nav-level item */}
                <NotificationPanel />
            </nav>

            <div className="sidebar-footer">
                <button className="nav-item logout-btn" onClick={handleLogout}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
