package com.okayji.report.dto.request;

import com.okayji.report.entity.ReportReason;
import com.okayji.report.entity.ReportTargetType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateReportRequest {
    @NotBlank(message = "Target ID must not be blank")
    String targetId;

    @NotNull(message = "Target type must not be null")
    ReportTargetType targetType;

    @NotNull(message = "Reason must not be null")
    ReportReason reason;

    String details;
}