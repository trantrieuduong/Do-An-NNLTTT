import React, { useState } from "react";
import AdminDashboard from "../pages/AdminDashboard";
import ModerationPanel from "../pages/ModerationPanel";
import ReportManagement from "../pages/ReportManagement";
import UserManagement from "../pages/UserManagement";
import "../styles/Admin.css";
import { LayoutDashboard, ShieldCheck, Flag, Users, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <h2>Admin Panel</h2>
        <nav className="admin-nav">
          <button
            className={`admin-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button
            className={`admin-nav-item ${activeTab === "moderation" ? "active" : ""}`}
            onClick={() => setActiveTab("moderation")}
          >
            <ShieldCheck size={20} /> Post Moderation
          </button>
          <button 
              className={`admin-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
          >
              <div className="nav-item-content">
                  <Flag size={20} /> 
                  <span> Report Management</span>
              </div>
          </button>
          <button 
              className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
          >
              <div className="nav-item-content">
                  <Users size={20} /> 
                  <span> User Management</span>
              </div>
          </button>

          <div className="sidebar-footer">
            <button className="nav-item admin-logout-btn" onClick={handleLogout}>
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>

      <div className="admin-content">
        {activeTab === "dashboard" && <AdminDashboard />}
        {activeTab === "moderation" && <ModerationPanel />}
        {activeTab === "reports" && <ReportManagement />}
        {activeTab === "users" && <UserManagement />}
      </div>
    </div>
  );
};

export default Admin;
