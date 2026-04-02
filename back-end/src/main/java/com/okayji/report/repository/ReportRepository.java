package com.okayji.report.repository;

import com.okayji.moderation.entity.TargetType;
import com.okayji.report.entity.Report;
import com.okayji.report.entity.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportRepository extends JpaRepository<Report, String> {
    Page<Report> findByStatus(ReportStatus status, Pageable pageable);

    long countByTargetIdAndTargetType(String targetId, TargetType targetType);

    // Kiểm tra xem user này đã report nội dung này chưa (tránh spam)
    boolean existsByReporterIdAndTargetId(String reporterId, String targetId);
}
