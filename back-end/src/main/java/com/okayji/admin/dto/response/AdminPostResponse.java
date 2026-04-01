package com.okayji.admin.dto.response;

import com.okayji.feed.dto.PostMediaDto;
import com.okayji.feed.entity.PostStatus;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminPostResponse {
    String id;
    String content;
    PostStatus status;
    Instant createdAt;
    String authorId;
    String authorName;
    String authorAvatarUrl;
    List<PostMediaDto> postMedia;
}
