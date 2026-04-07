package com.okayji.report.service;

import com.okayji.report.repository.ReportRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Slf4j(topic = "ReportCleanup-SERVICE")
@Service
@RequiredArgsConstructor
public class ReportCleanup {
    private final ReportRepository reportRepository;

    // Chạy vào lúc 00:00 ngày 1 hàng tháng
    @Scheduled(cron = "0 0 0 1 * ?")
    @Transactional
    public void deleteOldReports() {
        try {
            log.info("Bắt đầu tiến trình dọn dẹp Report cũ định kỳ...");
            Instant thirtyDaysAgo = Instant.now().minus(30, ChronoUnit.DAYS);
            int count = reportRepository.deleteByCreatedAtBefore(thirtyDaysAgo);

            // Cú pháp {} là cách truyền biến an toàn và tối ưu hiệu năng của SLF4J
            log.info("Hoàn tất! Đã dọn dẹp {} report cũ vào lúc: {}", count, Instant.now());
        } catch (Exception e) {
            log.error("Có lỗi xảy ra trong quá trình dọn dẹp Report: {}", e.getMessage(), e);
        }
    }
}
