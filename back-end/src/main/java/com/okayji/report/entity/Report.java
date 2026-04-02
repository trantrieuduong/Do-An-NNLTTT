package com.okayji.report.entity;

import com.okayji.identity.entity.User;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    User reporter;

    // ID của đối tượng bị báo cáo (có thể là postId, commentId hoặc userId)
    @Column(name = "target_id", nullable = false)
    String targetId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    ReportTargetType targetType; // POST, COMMENT, USER

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    ReportReason reason;

    String details;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    ReportStatus status = ReportStatus.PENDING;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    Instant createdAt;

    // Lưu vết admin nào đã xử lý report này
    String resolvedBy;
    Instant resolvedAt;
}
