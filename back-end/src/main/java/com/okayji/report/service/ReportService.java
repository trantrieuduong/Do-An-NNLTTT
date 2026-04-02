package com.okayji.report.service;

import com.okayji.report.dto.request.CreateReportRequest;
import com.okayji.report.dto.response.ReportResponse;
import com.okayji.report.entity.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReportService {
    Page<ReportResponse> getReports(ReportStatus status, Pageable pageable);
    ReportResponse resolveReport(String reportId, ReportStatus resolution, String adminId);
    void createReport(String reporterId, CreateReportRequest request);
}
