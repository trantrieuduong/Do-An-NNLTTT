package com.okayji.admin.controller;

import com.okayji.admin.dto.response.AdminPostResponse;
import com.okayji.admin.dto.response.ModerationDashboardStats;
import com.okayji.admin.service.AdminService;
import com.okayji.common.ApiResponse;
import com.okayji.feed.entity.PostStatus;
import com.okayji.identity.entity.User;
import com.okayji.report.dto.response.ReportResponse;
import com.okayji.report.entity.ReportStatus;
import com.okayji.report.service.ReportService;
import com.okayji.utils.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@AllArgsConstructor
@Tag(name = "Admin Controller")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private AdminService adminService;
    private ReportService reportService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get moderation dashboard stats")
    ApiResponse<ModerationDashboardStats> getDashboardStats(
            @RequestParam(required = false) Integer year
    ) {
        return ApiResponse.<ModerationDashboardStats>builder()
                .success(true)
                .message("Dashboard stats retrieved successfully")
                .data(adminService.getDashboardStats(year))
                .build();
    }

    @GetMapping("/posts")
    @Operation(summary = "Get posts for moderation")
    ApiResponse<Page<AdminPostResponse>> getPostsForModeration(
            @RequestParam(required = false, defaultValue = "UNDER_REVIEW") PostStatus status,
            Pageable pageable) {

        return ApiResponse.<Page<AdminPostResponse>>builder()
                .success(true)
                .message("Get posts for moderation successfully")
                .data(adminService.getPostsForModeration(status, pageable))
                .build();
    }

    @PutMapping("/posts/{postId}/decision")
    @Operation(summary = "Update post status manually by admin")
    ApiResponse<AdminPostResponse> updatePostStatus(
            @PathVariable String postId,
            @RequestParam PostStatus decision) {
        return ApiResponse.<AdminPostResponse>builder()
                .success(true)
                .message("Update post status successfully")
                .data(adminService.updatePostStatus(postId, decision))
                .build();
    }

    @GetMapping("/reports")
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

    @PutMapping("/reports/{reportId}/resolve")
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
