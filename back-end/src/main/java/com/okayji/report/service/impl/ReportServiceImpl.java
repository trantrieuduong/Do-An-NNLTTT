package com.okayji.report.service.impl;

import com.okayji.exception.AppError;
import com.okayji.exception.AppException;
import com.okayji.feed.dto.PostMediaDto;
import com.okayji.feed.entity.Comment;
import com.okayji.feed.entity.Post;
import com.okayji.feed.entity.PostStatus;
import com.okayji.feed.repository.CommentRepository;
import com.okayji.feed.repository.PostRepository;
import com.okayji.identity.entity.User;
import com.okayji.identity.repository.UserRepository;
import com.okayji.notification.service.NotificationFactory;
import com.okayji.notification.service.NotificationService;
import com.okayji.report.dto.request.CreateReportRequest;
import com.okayji.report.dto.response.ReportResponse;
import com.okayji.report.entity.Report;
import com.okayji.report.entity.ReportStatus;
import com.okayji.report.entity.ReportTargetType;
import com.okayji.report.repository.ReportRepository;
import com.okayji.report.service.ReportService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReportServiceImpl implements ReportService {
    ReportRepository reportRepository;
    UserRepository userRepository;
    PostRepository postRepository;
    CommentRepository commentRepository;
    NotificationService notificationService;


    @Override
    public Page<ReportResponse> getReports(ReportStatus status, Pageable pageable) {
        ReportStatus targetStatus = (status != null) ? status : ReportStatus.PENDING;
        Page<Report> reports = reportRepository.findByStatus(targetStatus, pageable);
        List<ReportResponse> responses = reports.getContent().stream()
                .map(this::convertReportToResponse)
                .collect(Collectors.toList());
        return new PageImpl<>(responses, pageable, reports.getTotalElements());
    }

    @Override
    @Transactional
    public void createReport(String reporterId, CreateReportRequest request) {
        if (reportRepository.existsByReporterIdAndTargetId(reporterId, request.getTargetId()))
            throw new AppException(AppError.DUPLICATE_REPORT_IN_A_TARGET);

        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Report report = Report.builder()
                .reporter(reporter)
                .targetId(request.getTargetId())
                .targetType(request.getTargetType())
                .reason(request.getReason())
                .details(request.getDetails())
                .status(ReportStatus.PENDING)
                .build();
        reportRepository.save(report);
    }

    private ReportResponse convertReportToResponse(Report report) {
        String targetContent = null;
        List<PostMediaDto> targetMedia = new ArrayList<>();

        // Load nội dung của bài post hoặc comment bị báo cáo
        if (report.getTargetType() == ReportTargetType.POST) {
            targetContent = postRepository.findById(report.getTargetId())
                    .map(post -> {
                        // Load media của post
                        if (post.getPostMedia() != null && !post.getPostMedia().isEmpty()) {
                            targetMedia.addAll(post.getPostMedia().stream()
                                    .map(m -> new PostMediaDto(m.getType(), m.getMediaUrl()))
                                    .toList());
                        }
                        return post.getContent();
                    })
                    .orElse("[Post has been deleted]");
        } else if (report.getTargetType() == ReportTargetType.COMMENT) {
            targetContent = commentRepository.findById(report.getTargetId())
                    .map(Comment::getContent)
                    .orElse("[Comment has been deleted]");
        }

        return ReportResponse.builder()
                .id(report.getId())
                .reporterId(report.getReporter().getId())
                .reporterName(report.getReporter().getUsername())
                .targetId(report.getTargetId())
                .targetType(report.getTargetType())
                .reason(report.getReason())
                .details(report.getDetails())
                .targetContent(targetContent)
                .targetMedia(targetMedia.isEmpty() ? null : targetMedia)
                .status(report.getStatus())
                .createdAt(report.getCreatedAt())
                .resolvedBy(report.getResolvedBy())
                .resolvedAt(report.getResolvedAt())
                .build();
    }

    @Override
    @Transactional
    public ReportResponse resolveReport(String reportId, ReportStatus newStatus, String adminId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new AppException(AppError.REPORT_NOT_FOUND));

        report.setStatus(newStatus);
        report.setResolvedBy(adminId);
        report.setResolvedAt(Instant.now());

        // Nếu báo cáo được chấp nhận (vi phạm được xác nhận)
        if (newStatus == ReportStatus.RESOLVED) {
            if (report.getTargetType() == ReportTargetType.POST) {
                Post targetPost = postRepository.findById(report.getTargetId())
                        .orElseThrow(() -> new AppException(AppError.POST_NOT_FOUND));
                notificationService.sendNotification(
                        NotificationFactory.violatedPost(
                                targetPost.getUser(),
                                targetPost.getId(),
                                PostStatus.REJECTED
                        )
                );
                targetPost.setStatus(PostStatus.REJECTED);
                postRepository.save(targetPost);
            } else if (report.getTargetType() == ReportTargetType.COMMENT) {
                Comment targetComment = commentRepository.findById(report.getTargetId())
                        .orElseThrow(() -> new AppException(AppError.COMMENT_NOT_FOUND));
                notificationService.sendNotification(
                        NotificationFactory.violatedComment(
                                targetComment.getUser(),
                                targetComment.getPost().getId()
                        )
                );
                commentRepository.deleteById(targetComment.getId());
            }
        }
        reportRepository.save(report);
        return convertReportToResponse(report);
    }
}
