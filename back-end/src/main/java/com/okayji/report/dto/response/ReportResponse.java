package com.okayji.report.dto.response;

import com.okayji.feed.dto.PostMediaDto;
import com.okayji.report.entity.ReportReason;
import com.okayji.report.entity.ReportStatus;
import com.okayji.report.entity.ReportTargetType;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReportResponse {
    String id;
    String reporterId;
    String reporterName;
    String targetId;
    ReportTargetType targetType;
    ReportReason reason;
    String details;
    String targetContent;
    List<PostMediaDto> targetMedia;
    ReportStatus status;
    Instant createdAt;
    String resolvedBy;
    Instant resolvedAt;

}
