package com.okayji.admin.dto.response;

import com.okayji.identity.entity.UserStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminUserResponse {
    String id;
    String username;
    String email;
    UserStatus status;
    Instant createdAt;
    String fullName;
    String avatarUrl;
}