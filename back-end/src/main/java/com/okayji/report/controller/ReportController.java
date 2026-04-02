package com.okayji.report.controller;

import com.okayji.report.dto.request.CreateReportRequest;
import com.okayji.report.dto.response.ReportResponse;
import com.okayji.common.ApiResponse;
import com.okayji.identity.entity.User;
import com.okayji.report.entity.ReportStatus;
import com.okayji.report.service.ReportService;
import com.okayji.utils.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;

    @PostMapping
    @Operation(summary = "Create a report")
    public ApiResponse<String> createReport(
            @Valid @RequestBody CreateReportRequest request,
            @CurrentUser User currentUser) {
        reportService.createReport(currentUser.getId(), request);
        return ApiResponse.<String>builder()
                .success(true)
                .message("Report submitted successfully")
                .build();
    }

    @GetMapping
    @Operation(summary = "Get reports for management")
    ApiResponse<Page<ReportResponse>> getReports(
            @RequestParam(required = false, defaultValue = "PENDING") ReportStatus status,
            Pageable pageable) {
        return ApiResponse.<Page<ReportResponse>>builder()
                .success(true)
                .message("Get reports successfully")
                .data(reportService.getReports(status, pageable))
                .build();
    }

    @PutMapping("/{reportId}/resolve")
    @Operation(summary = "Resolve a report by admin")
    ApiResponse<ReportResponse> resolveReport(
            @PathVariable String reportId,
            @RequestParam ReportStatus resolution,
            @CurrentUser User currentUser) {
        return ApiResponse.<ReportResponse>builder()
                .success(true)
                .message("Report resolved successfully")
                .data(reportService.resolveReport(reportId, resolution, currentUser.getId()))
                .build();
    }
}