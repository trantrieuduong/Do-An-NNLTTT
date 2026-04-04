package com.okayji.mapper;

import com.okayji.report.dto.response.ReportResponse;
import com.okayji.report.entity.Report;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReportMapper {
    // Ánh xạ từ Report Entity sang ReportResponse
    @Mapping(source = "report.reporter.id", target = "reporterId")
    @Mapping(source = "report.reporter.profile.fullName", target = "reporterName")

    @Mapping(source = "relatedPostId", target = "relatedPostId")

    // Các trường khác (như reason, status, targetId, targetType...)
    // có tên giống nhau giữa Entity và DTO thì MapStruct tự động map, không cần ghi thêm.

    ReportResponse toReportResponse(Report report, String relatedPostId);

    // Một hàm overload khác dùng cho các trường hợp không cần tính toán relatedPostId
    @Mapping(source = "reporter.id", target = "reporterId")
    @Mapping(source = "reporter.profile.fullName", target = "reporterName")
    @Mapping(target = "relatedPostId", ignore = true) // Bỏ qua field này
    ReportResponse toReportResponse(Report report);
}
