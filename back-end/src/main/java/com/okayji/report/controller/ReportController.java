package com.okayji.report.controller;

import com.okayji.report.dto.request.CreateReportRequest;
import com.okayji.common.ApiResponse;
import com.okayji.identity.entity.User;
import com.okayji.report.service.ReportService;
import com.okayji.utils.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
}