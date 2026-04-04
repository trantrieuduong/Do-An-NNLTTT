package com.okayji.admin.service;

import com.okayji.admin.dto.response.AdminPostResponse;
import com.okayji.admin.dto.response.AdminUserResponse;
import com.okayji.admin.dto.response.ModerationDashboardStats;
import com.okayji.feed.entity.PostStatus;
import com.okayji.identity.entity.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminService {
    ModerationDashboardStats getDashboardStats(Integer year);
    Page<AdminPostResponse> getPostsForModeration(PostStatus status, Pageable pageable);
    AdminPostResponse updatePostStatus(String postId, PostStatus newStatus);
    AdminUserResponse updateUserStatus(String userId, UserStatus newStatus);
    Page<AdminUserResponse> getUsersForModeration(UserStatus status, Pageable pageable);
}
