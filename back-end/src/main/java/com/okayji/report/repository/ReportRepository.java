package com.okayji.report.repository;

import com.okayji.report.entity.Report;
import com.okayji.report.entity.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;

@Repository
public interface ReportRepository extends JpaRepository<Report, String> {
    Page<Report> findByStatus(ReportStatus status, Pageable pageable);

    // Kiểm tra xem user này đã report nội dung này chưa (tránh spam)
    boolean existsByReporterIdAndTargetId(String reporterId, String targetId);

    @Modifying // Bắt buộc phải có khi dùng @Query để thao tác DELETE hoặc UPDATE
    @Query("DELETE FROM Report r WHERE r.createdAt < :expiryDate")
    int deleteByCreatedAtBefore(@Param("expiryDate") Instant expiryDate);
}
