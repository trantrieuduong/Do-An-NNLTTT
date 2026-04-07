package com.okayji.report.service;

import com.okayji.report.repository.ReportRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class ReportCleanup {
    private final ReportRepository reportRepository;

    // Chạy vào lúc 00:00 ngày 1 hàng tháng
    @Scheduled(cron = "0 0 0 1 * ?")
    @Transactional
    public void deleteOldReports() {
        Instant thirtyDaysAgo = Instant.now().minus(30, ChronoUnit.DAYS);

        int count = reportRepository.deleteByCreatedAtBefore(thirtyDaysAgo);
        System.out.println("Đã dọn dẹp " + count + " report cũ vào lúc: " + Instant.now());
    }
}
