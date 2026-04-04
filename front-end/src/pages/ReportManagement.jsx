import React, { useState, useEffect } from "react";
import { reportService } from "../api/reportService";
import toast from "react-hot-toast";
import "../styles/Admin.css";
import {
  AlertCircle,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Flag,
} from "lucide-react";

const ReportManagement = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [expandedReportId, setExpandedReportId] = useState(null);
  const [processingReportId, setProcessingReportId] = useState(null);
  const PAGE_SIZE = 10;

  useEffect(() => {
    loadReports();
  }, [page, statusFilter]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await reportService.getReports(
        statusFilter,
        page,
        PAGE_SIZE,
      );
      console.log("Reports response:", response);

      const content = response.content || response.data?.content || [];
      const totalPages = response.totalPages || response.data?.totalPages || 0;
      const totalElements =
        response.totalElements || response.data?.totalElements || 0;

      setReports(content);
      setTotalPages(totalPages);
      setTotalElements(totalElements);
    } catch (error) {
      console.error("Load reports error:", error);
      toast.error(`Failed to load reports: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResolution = async (reportId, resolution) => {
    try {
      setProcessingReportId(reportId);
      await reportService.resolveReport(reportId, resolution);
      toast.success(`Report ${resolution.toLowerCase()}`);
      loadReports();
    } catch (error) {
      console.error("Resolve report error:", error);
      toast.error(`Failed to resolve report: ${error.message}`);
    } finally {
      setProcessingReportId(null);
    }
  };

  const toggleExpanded = (reportId) => {
    setExpandedReportId(expandedReportId === reportId ? null : reportId);
  };

  const getStatusBadgeColor = (status) => {
    const statusMap = {
      PENDING: "pending",
      RESOLVED: "approved",
      DISMISSED: "rejected",
    };
    return statusMap[status] || "pending";
  };

  const getTargetTypeDisplay = (targetType) => {
    const typeMap = {
      POST: "Post",
      COMMENT: "Comment",
      USER: "User",
    };
    return typeMap[targetType] || targetType;
  };

  if (loading && reports.length === 0) {
    return <div className="moderation-panel loading">Loading reports...</div>;
  }

  return (
    <div className="moderation-panel">
      <div className="panel-header">
        <h1>Report Management</h1>
        <div className="filter-controls">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="filter-select"
          >
            <option value="PENDING">Pending</option>
            <option value="RESOLVED">Approved</option>
            <option value="DISMISSED">Dismissed</option>
          </select>
        </div>
      </div>

      <div className="job-count">
        Showing {reports.length} of {totalElements} items
      </div>

      {reports.length === 0 ? (
        <div className="no-jobs">
          <p>No reports found for this status.</p>
        </div>
      ) : (
        <div className="job-list">
          {reports.map((report) => (
            <div
              key={report.id}
              className={`job-card job-status-${report.status.toLowerCase()}`}
            >
              <div
                className="job-header"
                onClick={() => toggleExpanded(report.id)}
              >
                <div className="job-info">
                  <span className="job-type badge">
                    <Flag size={16} />
                    {getTargetTypeDisplay(report.targetType)} REPORT
                  </span>
                  <span className="author-tag-wrapper">
                    <AlertCircle size={16} />
                    <span className="reason-tag">{report.reason}</span>
                  </span>
                  <span
                    className={`job-status badge status-${getStatusBadgeColor(
                      report.status,
                    ).toLowerCase()}`}
                  >
                    {report.status}
                  </span>
                  <span className="char-count-row">
                    <User size={16} /> Reported by: {report.reporterName}
                  </span>
                  <span className="job-date-row">
                    <Clock size={16} />
                    {new Date(report.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    - {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="job-toggle">
                  {expandedReportId === report.id ? "▼" : "▶"}
                </div>
              </div>

              {expandedReportId === report.id && (
                <div className="job-details">
                  <div className="report-section">
                    <h4>Report Details:</h4>
                    <div className="detail-row">
                      <span className="detail-label">Reason: </span>
                      <span className="detail-value">{report.reason}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Target Type: </span>
                      <span className="detail-value">
                        {getTargetTypeDisplay(report.targetType)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Target ID: </span>
                      <span className="detail-value">{report.targetId}</span>
                    </div>
                    {report.details && (
                      <div className="detail-row full-width">
                        <span className="detail-label">
                          Additional details:
                        </span>
                        <p className="detail-value">{report.details}</p>
                      </div>
                    )}
                  </div>

                  {report.targetContent && (
                    <div
                      className="content-section"
                      style={{ marginTop: "15px" }}
                    >
                      <h4>
                        {getTargetTypeDisplay(report.targetType)} Content:
                      </h4>
                      <p className="content-text">{report.targetContent}</p>

                      {report.targetMedia && report.targetMedia.length > 0 && (
                        <div
                          className="admin-media-container"
                          style={{ marginTop: "10px" }}
                        >
                          {report.targetMedia.map((media, index) => (
                            <div key={index} className="admin-media-item">
                              {media.type === "IMAGE" ? (
                                <img
                                  src={media.mediaUrl}
                                  alt="Report media"
                                  className="moderation-img"
                                  onClick={() =>
                                    window.open(media.mediaUrl, "_blank")
                                  }
                                />
                              ) : (
                                <video
                                  src={media.mediaUrl}
                                  controls
                                  className="moderation-video"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    className="reporter-section"
                    style={{ marginTop: "15px" }}
                  >
                    <h4>Reporter: </h4>
                    <div className="reporter-info">
                      <span className="reporter-name">
                        {report.reporterName}-
                      </span>
                      <span className="reporter-id">
                        ID: {report.reporterId}
                      </span>
                    </div>
                  </div>

                  {report.status === "PENDING" && (
                    <div className="action-buttons">
                      <button
                        className="btn btn-approve"
                        onClick={() =>
                          handleResolution(report.id, "RESOLVED")
                        }
                        disabled={processingReportId === report.id}
                      >
                        <CheckCircle size={16} />
                        {processingReportId === report.id
                          ? "Processing..."
                          : "Approve Report"}
                      </button>

                      <button
                        className="btn btn-block"
                        onClick={() =>
                          handleResolution(report.id, "DISMISSED")
                        }
                        disabled={processingReportId === report.id}
                      >
                        <XCircle size={16} />
                        {processingReportId === report.id
                          ? "Processing..."
                          : "Reject Report"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
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

export default ReportManagement;