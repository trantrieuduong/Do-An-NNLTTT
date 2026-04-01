import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ChatProvider } from './context/ChatContext';
import { NotificationProvider } from './context/NotificationContext';
import { useChat } from './context/ChatContext';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Friends from './pages/Friends';
import PostDetail from './pages/PostDetail';
import Security from './pages/Security';
import Admin from './pages/Admin';

// Protected route: redirect to /login if no token
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" replace />;
};

// Public route: redirect to / if already logged in
const PublicRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return !token ? children : <Navigate to="/" replace />;
};

// Inner wrapper: access ChatContext to share stompClient with NotificationProvider
const InnerApp = () => {
    const { stompClient, isConnected } = useChat();

    return (
        <NotificationProvider stompClient={stompClient} isConnected={isConnected}>
            <BrowserRouter>
                <Toaster position="top-right" />
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

                    {/* Protected routes */}
                    <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
                    <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
                    <Route path="/friends" element={<PrivateRoute><Friends /></PrivateRoute>} />
                    <Route path="/my-profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                    <Route path="/profile/:userId" element={<PrivateRoute><Profile /></PrivateRoute>} />
                    <Route path="/post/:postId" element={<PrivateRoute><PostDetail /></PrivateRoute>} />
                    <Route path="/security" element={<PrivateRoute><Security /></PrivateRoute>} />
                    <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </NotificationProvider>
    );
};

const App = () => {
    return (
        <ChatProvider>
            <InnerApp />
        </ChatProvider>
    );
};

export default App;
