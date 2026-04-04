import React, { useState, useEffect } from "react";
import { adminService } from "../api/adminService";
import toast from "react-hot-toast";
import "../styles/Admin.css";
import { User, ExternalLink, Save } from "lucide-react";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  
  // Lưu trạng thái được chọn trên dropdown của từng user (Key: userId, Value: status)
  const [selectedStatuses, setSelectedStatuses] = useState({});
  // Trạng thái loading khi đang lưu 1 user cụ thể
  const [updatingUserId, setUpdatingUserId] = useState(null);

  const PAGE_SIZE = 10;

  useEffect(() => {
    loadUsers();
  }, [page, statusFilter]);

  // Khởi tạo/Cập nhật selectedStatuses mỗi khi danh sách users thay đổi
  useEffect(() => {
    const initialStatuses = {};
    users.forEach((u) => {
      initialStatuses[u.id] = u.status;
    });
    setSelectedStatuses(initialStatuses);
  }, [users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllUsers(statusFilter, page, PAGE_SIZE);
      
      const content = response.data?.content || response.content || [];
      const totalPagesData = response.data?.totalPages || response.totalPages || 0;
      const totalElementsData = response.data?.totalElements || response.totalElements || 0;

      setUsers(content);
      setTotalPages(totalPagesData);
      setTotalElements(totalElementsData);
    } catch (error) {
      console.error("Load users error:", error);
      toast.error(`Failed to load users: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (userId, newStatus) => {
    setSelectedStatuses((prev) => ({ ...prev, [userId]: newStatus }));
  };

  const handleSaveStatus = async (userId) => {
    const newStatus = selectedStatuses[userId];
    try {
      setUpdatingUserId(userId);
      await adminService.updateUserStatus(userId, newStatus);
      toast.success("User status updated successfully!");
      loadUsers(); // Load lại danh sách để đồng bộ trạng thái mới
    } catch (error) {
      console.error("Update status error:", error);
      toast.error(`Failed to update status: ${error.message}`);
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (loading && users.length === 0) {
    return <div className="moderation-panel loading">Loading users...</div>;
  }

  return (
    <div className="moderation-panel">
      <div className="panel-header">
        <h1>User Management</h1>
        
        <div className="filter-controls">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="filter-select"
          >
            <option value="ACTIVE">Active Users</option>
            <option value="SUSPENDED">Suspended Users</option>
            <option value="DELETED">Deleted Users</option>
          </select>
        </div>
      </div>

      <div className="job-count">
        Showing {users.length} of {totalElements} items
      </div>

      {users.length === 0 ? (
        <div className="no-jobs">
          <p>No users found for this status.</p>
        </div>
      ) : (
        <div className="job-list">
          {users.map((user) => {
            // Kiểm tra xem dropdown hiện tại có khác với trạng thái ban đầu không
            const isChanged = selectedStatuses[user.id] !== user.status;
            const isUpdatingThisUser = updatingUserId === user.id;

            return (
              <div key={user.id} className="job-card" style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "15px" }}>
                  
                  {/* Thông tin User */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", fontSize: "1.1rem", fontWeight: "bold" }}>
                      <User size={20} className="text-gray-600" />
                      {user.fullName ? user.fullName : "No Full Name"}
                    </div>
                    
                    <div style={{ color: "#475569", fontSize: "0.95rem", marginBottom: "12px", marginLeft: "28px" }}>
                      <span style={{ fontWeight: "500" }}>@{user.username}</span>
                      {user.email && <span> • {user.email}</span>}
                    </div>

                    <a
                      href={`/profile/${user.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "#4f46e5",
                        textDecoration: "none",
                        fontSize: "0.85rem",
                        fontWeight: "500",
                        backgroundColor: "#e0e7ff",
                        padding: "4px 10px",
                        borderRadius: "12px",
                        marginLeft: "28px"
                      }}
                    >
                      <ExternalLink size={14} /> Open Profile
                    </a>
                  </div>

                  {/* Hành động đổi Status */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: "500" }}>Status:</span>
                    <select
                      value={selectedStatuses[user.id] || user.status}
                      onChange={(e) => handleStatusChange(user.id, e.target.value)}
                      disabled={isUpdatingThisUser}
                      className="filter-select"
                      style={{ minWidth: "140px", margin: 0 }}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                      <option value="DELETED">DELETED</option>
                    </select>

                    <button
                      className="btn btn-approve"
                      onClick={() => handleSaveStatus(user.id)}
                      disabled={isUpdatingThisUser || !isChanged}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 16px",
                        margin: 0,
                        opacity: (isUpdatingThisUser || !isChanged) ? 0.6 : 1,
                        cursor: (isUpdatingThisUser || !isChanged) ? "not-allowed" : "pointer",
                      }}
                    >
                      <Save size={16} />
                      {isUpdatingThisUser ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="page-btn"
          >
            ← Previous
          </button>
          <span className="page-info">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="page-btn"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default UserManagement;