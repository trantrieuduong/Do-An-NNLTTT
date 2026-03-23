import React, { useState } from 'react';
import { Mail, Lock, User, UserPlus, Github, Chrome, Calendar, AlertCircle, Loader2, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';
import '../styles/Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: '',
        birthday: '',
        gender: 'MALE',
    });
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
            const response = await authService.register(formData);
            console.log('Registration success:', response);
            // On success, navigate to login
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page-wrapper">
            <div className="auth-container">
                <div className="auth-header">
                    <h1>Create Account</h1>
                    <p>Join us to start your journey today</p>
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
                                placeholder="choose your username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                            <User />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Full Name</label>
                        <div className="input-wrapper">
                            <input
                                name="fullName"
                                type="text"
                                placeholder="Enter your full name"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                            <User />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <div className="input-wrapper">
                            <input
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <Mail />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Birthday</label>
                        <div className="input-wrapper">
                            <input
                                name="birthday"
                                type="date"
                                value={formData.birthday}
                                onChange={handleChange}
                                required
                            />
                            <Calendar />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Gender</label>
                        <div className="gender-group">
                            <label className="gender-option">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="MALE"
                                    checked={formData.gender === 'MALE'}
                                    onChange={handleChange}
                                />
                                <div className="gender-label">Male</div>
                            </label>
                            <label className="gender-option">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="FEMALE"
                                    checked={formData.gender === 'FEMALE'}
                                    onChange={handleChange}
                                />
                                <div className="gender-label">Female</div>
                            </label>
                            <label className="gender-option">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="OTHER"
                                    checked={formData.gender === 'OTHER'}
                                    onChange={handleChange}
                                />
                                <div className="gender-label">Other</div>
                            </label>
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

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="social-login">
                    <div className="divider">Or register with</div>
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
                    Already have an account? <Link to="/login">Sign In</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
