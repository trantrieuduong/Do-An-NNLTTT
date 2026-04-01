package com.okayji.admin.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.util.List;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
@Builder
public class ModerationDashboardStats {
    long totalApproved;
    long totalBlocked;
    long totalReviewing;
    long totalPosts;
    long totalUsers;
    private List<MonthlyUserStat> monthlyUsers;
}
