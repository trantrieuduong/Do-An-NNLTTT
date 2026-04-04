package com.okayji.feed.repository;

import com.okayji.feed.entity.Post;
import com.okayji.feed.entity.PostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Collection;

public interface PostRepository extends JpaRepository<Post,String> {
    Page<Post> findByUserId(String userId, Pageable pageable);

    @Query("""
        select p
        from Post p
        where p.user.id = :userId
        and p.status = com.okayji.feed.entity.PostStatus.PUBLISHED
    """)
    Page<Post> findPublishedPostsByUserId(@Param("userId") String userId, Pageable pageable);

    @Query("""
        select p
        from Post p
        where p.user.id in :authorIds
        and p.status = com.okayji.feed.entity.PostStatus.PUBLISHED
        order by p.createdAt desc, p.id desc
    """)
    Slice<Post> findFeedFirstPage(@Param("authorIds") Collection<String> authorIds, Pageable pageable);

    @Query("""
        select p
        from Post p
        where p.user.id in :authorIds
        and p.status = com.okayji.feed.entity.PostStatus.PUBLISHED
        and (p.createdAt < :cursorTime or (p.createdAt = :cursorTime and p.id < :cursorId))
        order by p.createdAt desc, p.id desc
    """)
    Slice<Post> findFeedAfterCursor(@Param("authorIds") Collection<String> authorIds,
                                    @Param("cursorTime") Instant cursorTime,
                                    @Param("cursorId") String cursorId,
                                    Pageable pageable);

    long countByStatus(PostStatus status);

    Page<Post> findByStatus(PostStatus status, Pageable pageable);

    @Query("""
    select p from Post p
    where lower(cast(p.content as string)) like lower(concat('%', :keyword, '%'))
    and p.status = PostStatus.PUBLISHED
    and (
        p.user.id = :viewerId
        or p.user.profile.visibility = 'PUBLIC'
        or (
            p.user.profile.visibility = 'FRIEND_ONLY'
            and exists (
                select 1 from Friend f
                where (f.userLow.id = p.user.id and f.userHigh.id = :viewerId)
                   or (f.userLow.id = :viewerId and f.userHigh.id = p.user.id)
            )
        )
    )
    order by p.createdAt desc
""")
    Page<Post> searchPublishedPosts(@Param("viewerId") String viewerId, @Param("keyword") String keyword, Pageable pageable);
}
