import React, { useState } from "react";
import AdminDashboard from "../pages/AdminDashboard";
import ModerationPanel from "../pages/ModerationPanel";
import "../styles/Admin.css";
import { LayoutDashboard, ShieldCheck, LogOut } from "lucide-react";
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
      </div>
    </div>
  );
};

export default Admin;
