package com.okayji.report.entity;

public enum ReportStatus {
    PENDING, // Đang chờ Admin xem
    RESOLVED, // Báo cáo được chấp nhận
    DISMISSED  // Báo cáo bị từ chối (không vi phạm)
}
