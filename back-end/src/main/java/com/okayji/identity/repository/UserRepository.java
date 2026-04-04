package com.okayji.identity.repository;

import com.okayji.identity.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User,String> {
    User findUserById(String id);
    Optional<User> findUserByIdOrUsername(String id, String username);
    long countByCreatedAtBetween(Instant startDate, Instant endDate);

    @Query("""
        select u from User u 
        where lower(u.username) like lower(concat('%', :keyword, '%')) 
        or lower(u.profile.fullName) like lower(concat('%', :keyword, '%'))
    """)
    Page<User> searchUsers(@Param("keyword") String keyword, Pageable pageable);
}
