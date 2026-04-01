package com.okayji.admin.service.impl;

import com.okayji.admin.dto.response.AdminPostResponse;
import com.okayji.admin.dto.response.ModerationDashboardStats;
import com.okayji.admin.dto.response.MonthlyUserStat;
import com.okayji.admin.service.AdminService;
import com.okayji.feed.dto.PostMediaDto;
import com.okayji.feed.entity.Post;
import com.okayji.feed.entity.PostStatus;
import com.okayji.feed.repository.PostRepository;
import com.okayji.identity.repository.UserRepository;
import com.okayji.moderation.entity.TargetType;
import com.okayji.moderation.repository.ModerationJobRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Transactional(readOnly = true)
public class AdminServiceImpl implements AdminService {
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final ModerationJobRepository moderationJobRepository;

    @Override
    public ModerationDashboardStats getDashboardStats(Integer year) {
        long totalBlocked = postRepository.countByStatus(PostStatus.REJECTED);
        long totalApproved = postRepository.countByStatus(PostStatus.PUBLISHED);
        long totalReviewing = postRepository.countByStatus(PostStatus.UNDER_REVIEW);
        long totalUsers = userRepository.count();
        long totalPosts = moderationJobRepository.countByTargetType(TargetType.POST);

        int targetYearValue = (year != null) ? year : Year.now().getValue();
        List<MonthlyUserStat> monthlyUsers = new ArrayList<>();

        for (int i = 1; i <= 12; i++) {
            YearMonth targetMonth = YearMonth.of(targetYearValue, i);

            // Ngày đầu tháng lúc 00:00:00
            LocalDateTime startOfMonth = targetMonth.atDay(1).atStartOfDay();
            // Ngày cuối tháng lúc 23:59:59.999999999
            LocalDateTime endOfMonth = targetMonth.atEndOfMonth().atTime(23, 59, 59, 999999999);

            Instant startInstant = startOfMonth.atZone(ZoneId.systemDefault()).toInstant();
            Instant endInstant = endOfMonth.atZone(ZoneId.systemDefault()).toInstant();
            long count = userRepository.countByCreatedAtBetween(startInstant, endInstant);
            String monthName = String.valueOf(targetMonth.getMonthValue());// Vd: 10, 11
            monthlyUsers.add(new MonthlyUserStat(monthName, count));
        }
        return ModerationDashboardStats.builder()
                .totalUsers(totalUsers)
                .totalApproved(totalApproved)
                .totalBlocked(totalBlocked)
                .totalReviewing(totalReviewing)
                .totalPosts(totalPosts)
                .monthlyUsers(monthlyUsers)
                .build();
    }

    @Override
    public Page<AdminPostResponse> getPostsForModeration(PostStatus status, Pageable pageable) {
        PostStatus targetStatus = (status != null) ? status: PostStatus.UNDER_REVIEW;
        Page<Post> posts = postRepository.findByStatus(targetStatus, pageable);
        List<AdminPostResponse> responses = posts.getContent().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return new PageImpl<>(responses, pageable, posts.getTotalElements());
    }

    @Override
    public AdminPostResponse updatePostStatus(String postId, PostStatus newStatus) {
        Post post = postRepository.findById(postId).orElseThrow(()->new IllegalArgumentException("Post not found - id: " + postId));
        post.setStatus(newStatus);
        postRepository.save(post);
        return convertToResponse(post);
    }

    private AdminPostResponse convertToResponse(Post post) {
        return AdminPostResponse.builder()
                .id(post.getId())
                .content(post.getContent())
                .status(post.getStatus())
                .createdAt(post.getCreatedAt())
                .authorId(post.getUser().getId())
                .authorName(post.getUser().getUsername())
                .authorAvatarUrl(post.getUser().getProfile().getAvatarUrl())
                .postMedia(post.getPostMedia().stream()
                        .map(m -> new PostMediaDto(m.getType(), m.getMediaUrl()))
                        .collect(Collectors.toList()))
                .build();
    }
}
