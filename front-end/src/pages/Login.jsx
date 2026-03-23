import React, { useState } from 'react';
import { User, Lock, LogIn, Github, Chrome, AlertCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import { authService } from '../api/authService';
import '../styles/Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const { connect } = useChat();
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authService.login({
                ...formData,
                rememberMe: rememberMe
            });
            console.log('Login success:', response);
            if (response.data && response.data.accessToken) {
                // Connect to chat after successful login
                connect(response.data.accessToken);
            }
            navigate('/');
        } catch (err) {
            setError(err.message || 'Failed to login. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page-wrapper">
            <div className="auth-container">
                <div className="auth-header">
                    <h1>Welcome Back</h1>
                    <p>Enter your username to access your account</p>
                </div>

                {error && (
                    <div className="error-message" style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        padding: '0.75rem',
                        borderRadius: '12px',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem'
                    }}>
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <div className="input-wrapper">
                            <input
                                name="username"
                                type="text"
                                placeholder="your username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                            <User />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-wrapper">
                            <input
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <Lock />
                        </div>
                    </div>

                    <div className="form-options">
                        <label className="remember-me">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <span>Remember me</span>
                        </label>
                        <Link to="/forgot-password" style={{ color: 'var(--primary)', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 500 }}>
                            Forgot password?
                        </Link>
                    </div>

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="social-login">
                    <div className="divider">Or continue with</div>
                    <div className="social-buttons">
                        <button className="social-btn">
                            <Chrome size={20} />
                        </button>
                        <button className="social-btn">
                            <Github size={20} />
                        </button>
                    </div>
                </div>

                <div className="auth-footer">
                    Don't have an account? <Link to="/register">Sign Up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
