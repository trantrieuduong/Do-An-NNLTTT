import React, { useState } from 'react';
import MainLayout from '../components/MainLayout';
import { userService } from '../api/userService';
import { Key, ChevronRight, ArrowLeft, Loader2, CheckCircle2, AlertCircle, AtSign } from 'lucide-react';
import '../styles/Security.css';

const Security = () => {
    const [view, setView] = useState('list'); // 'list', 'change-password', or 'change-username'

    // Password state
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        newPasswordConfirm: ''
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    // Username state
    const [usernameData, setUsernameData] = useState({
        newUsername: '',
        password: ''
    });
    const [usernameLoading, setUsernameLoading] = useState(false);
    const [usernameMessage, setUsernameMessage] = useState({ type: '', text: '' });

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.newPasswordConfirm) {
            setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        setPasswordLoading(true);
        setPasswordMessage({ type: '', text: '' });
        try {
            const res = await userService.changePassword(passwordData);
            if (res.success) {
                setPasswordMessage({ type: 'success', text: res.message || 'Password changed successfully' });
                setPasswordData({ oldPassword: '', newPassword: '', newPasswordConfirm: '' });
                setTimeout(() => {
                    setView('list');
                    setPasswordMessage({ type: '', text: '' });
                }, 2000);
            } else {
                setPasswordMessage({ type: 'error', text: res.message || 'Failed to change password' });
            }
        } catch (error) {
            setPasswordMessage({ type: 'error', text: error.message || 'An error occurred' });
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleChangeUsername = async (e) => {
        e.preventDefault();
        setUsernameLoading(true);
        setUsernameMessage({ type: '', text: '' });
        try {
            const res = await userService.changeUsername(usernameData);
            if (res.success) {
                setUsernameMessage({ type: 'success', text: res.message || 'Username changed successfully' });
                setUsernameData({ newUsername: '', password: '' });
                setTimeout(() => {
                    setView('list');
                    setUsernameMessage({ type: '', text: '' });
                }, 2000);
            } else {
                setUsernameMessage({ type: 'error', text: res.message || 'Failed to change username' });
            }
        } catch (error) {
            setUsernameMessage({ type: 'error', text: error.message || 'An error occurred' });
        } finally {
            setUsernameLoading(false);
        }
    };

    const handleBack = () => {
        setView('list');
        setPasswordMessage({ type: '', text: '' });
        setUsernameMessage({ type: '', text: '' });
        setPasswordData({ oldPassword: '', newPassword: '', newPasswordConfirm: '' });
        setUsernameData({ newUsername: '', password: '' });
    };

    return (
        <MainLayout>
            <div className="security-container">
                <div className="security-card">
                    <h2>
                        {view !== 'list' && (
                            <button className="security-back-btn" onClick={handleBack}>
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        Security Settings
                    </h2>

                    {view === 'list' && (
                        <div className="security-list">
                            <div className="security-list-item" onClick={() => setView('change-password')}>
                                <div className="security-list-item-icon">
                                    <Key size={22} />
                                </div>
                                <div className="security-list-item-content">
                                    <span className="security-list-item-title">Change your password</span>
                                    <span className="security-list-item-desc">Update your login password regularly for better security.</span>
                                </div>
                                <div className="security-list-item-arrow">
                                    <ChevronRight size={20} />
                                </div>
                            </div>

                            <div className="security-list-item" onClick={() => setView('change-username')}>
                                <div className="security-list-item-icon">
                                    <AtSign size={22} />
                                </div>
                                <div className="security-list-item-content">
                                    <span className="security-list-item-title">Change your username</span>
                                    <span className="security-list-item-desc">Pick a new unique username for your profile.</span>
                                </div>
                                <div className="security-list-item-arrow">
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        </div>
                    )}

                    {view === 'change-password' && (
                        <div className="security-form-container">
                            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Key size={20} /> Change Password
                            </h3>

                            {passwordMessage.text && (
                                <div className={`message ${passwordMessage.type}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {passwordMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                    {passwordMessage.text}
                                </div>
                            )}

                            <form onSubmit={handleChangePassword} className="security-form">
                                <div className="form-group">
                                    <label>Current Password</label>
                                    <input
                                        type="password"
                                        className="security-input"
                                        placeholder="Enter current password"
                                        value={passwordData.oldPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>New Password</label>
                                    <input
                                        type="password"
                                        className="security-input"
                                        placeholder="Min. 8 characters"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        required
                                        minLength={8}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Confirm New Password</label>
                                    <input
                                        type="password"
                                        className="security-input"
                                        placeholder="Confirm your new password"
                                        value={passwordData.newPasswordConfirm}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPasswordConfirm: e.target.value })}
                                        required
                                        minLength={8}
                                    />
                                </div>
                                <button type="submit" className="security-submit-btn" disabled={passwordLoading}>
                                    {passwordLoading ? <Loader2 className="animate-spin" size={20} /> : 'Update Password'}
                                </button>
                            </form>
                        </div>
                    )}

                    {view === 'change-username' && (
                        <div className="security-form-container">
                            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <AtSign size={20} /> Change Username
                            </h3>

                            {usernameMessage.text && (
                                <div className={`message ${usernameMessage.type}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {usernameMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                    {usernameMessage.text}
                                </div>
                            )}

                            <form onSubmit={handleChangeUsername} className="security-form">
                                <div className="form-group">
                                    <label>New Username</label>
                                    <input
                                        type="text"
                                        className="security-input"
                                        placeholder="Enter new unique username"
                                        value={usernameData.newUsername}
                                        onChange={(e) => setUsernameData({ ...usernameData, newUsername: e.target.value })}
                                        required
                                        minLength={3}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Confirm with Password</label>
                                    <input
                                        type="password"
                                        className="security-input"
                                        placeholder="Confirm current password"
                                        value={usernameData.password}
                                        onChange={(e) => setUsernameData({ ...usernameData, password: e.target.value })}
                                        required
                                    />
                                </div>
                                <button type="submit" className="security-submit-btn" disabled={usernameLoading}>
                                    {usernameLoading ? <Loader2 className="animate-spin" size={20} /> : 'Update Username'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default Security;
