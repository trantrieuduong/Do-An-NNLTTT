use Okayji;

create table if not exists invalidated_token
(
    id          varchar(255) not null
        primary key,
    expiry_time datetime(6)  null
);

create table if not exists moderation_job
(
    id          bigint auto_increment
        primary key,
    created_at  datetime(6)                                      not null,
    max_retries int                                              not null,
    retry_count int                                              not null,
    status      enum ('DONE', 'FAILED', 'PENDING', 'PROCESSING') not null,
    target_id   varchar(255)                                     not null,
    target_type enum ('COMMENT', 'POST')                         not null
);

create table if not exists moderation_result
(
    id                bigint auto_increment
        primary key,
    categories        json                                  null,
    category_scores   json                                  null,
    created_at        datetime(6)                           not null,
    decision          enum ('ALLOW', 'BLOCK', 'REVIEW')     not null,
    flagged           bit                                   not null,
    moderation_job_id bigint                                not null,
    input_type        enum ('IMAGE', 'TEXT', 'VIDEO_FRAME') not null,
    constraint FKkv5buiqtwv8ujn2a1gj4icxps
        foreign key (moderation_job_id) references moderation_job (id)
);

create table if not exists role
(
    name        enum ('ADMIN', 'USER') not null
        primary key,
    description varchar(255)           null
);

create table if not exists user
(
    id                   varchar(255)                                        not null
        primary key,
    created_at           datetime(6)                                         not null,
    email                varchar(255) collate utf8mb4_unicode_ci             not null,
    oauth_id             varchar(255)                                        null,
    oauth_provider       varchar(255)                                        null,
    password             varchar(255)                                        null,
    username             varchar(255) collate utf8mb4_unicode_ci             not null,
    status               enum ('ACTIVE', 'DELETED', 'INACTIVE', 'SUSPENDED') null,
    last_change_username datetime(6)                                         null,
    updated_at           datetime(6)                                         null,
    constraint uk_user_email
        unique (email),
    constraint uk_user_username
        unique (username)
);

create table if not exists chat
(
    id               varchar(255)             not null
        primary key,
    chat_avatar_url  varchar(255)             null,
    chat_name        varchar(255)             null,
    created_at       datetime(6)              not null,
    type             enum ('DIRECT', 'GROUP') not null,
    created_by       varchar(255)             not null,
    direct_key       varchar(255)             null,
    last_message_at  datetime(6)              null,
    last_message_seq bigint                   null,
    constraint uk_chat_direct_key
        unique (direct_key),
    constraint FKqyptuinfeykad0qqs5ocfa0sq
        foreign key (created_by) references user (id)
);

create table if not exists chat_member
(
    id            bigint auto_increment
        primary key,
    joined_at     datetime(6)  not null,
    last_read_seq bigint       null,
    chat_id       varchar(255) not null,
    member_id     varchar(255) not null,
    constraint uk_chat_member
        unique (chat_id, member_id),
    constraint FKm2x3qmpjhy3on2p37b8opb18m
        foreign key (member_id) references user (id),
    constraint FKq3bag9kv2ntqcmkan5xhdeohb
        foreign key (chat_id) references chat (id)
);

create index idx_chat_id
    on chat_member (chat_id);

create index idx_member_id
    on chat_member (member_id);

create table if not exists friend
(
    id           varchar(255) not null
        primary key,
    user_high_id varchar(255) not null,
    user_low_id  varchar(255) not null,
    constraint uk_friends_pair
        unique (user_low_id, user_high_id),
    constraint FK5n7ayp6llqqrugjyudpgo0g60
        foreign key (user_high_id) references user (id),
    constraint FKmjsmi27kip14ihxkx0sei0lsa
        foreign key (user_low_id) references user (id)
);

create index ix_friends_high
    on friend (user_high_id);

create index ix_friends_low
    on friend (user_low_id);

create table if not exists friend_request
(
    id          varchar(255) not null
        primary key,
    created_at  datetime(6)  not null,
    receiver_id varchar(255) not null,
    sender_id   varchar(255) not null,
    constraint uk_fr_pair
        unique (sender_id, receiver_id),
    constraint FK9rnftqmm2lmkhv4xrq8b9lp4f
        foreign key (sender_id) references user (id),
    constraint FKpu7xdjn95orp6rucjsxps7gkg
        foreign key (receiver_id) references user (id)
);

create index ix_fr_receive
    on friend_request (receiver_id);

create index ix_fr_send
    on friend_request (sender_id);

create table if not exists message
(
    id         bigint auto_increment
        primary key,
    content    longtext                                null,
    created_at datetime(6)                             not null,
    seq        bigint                                  not null,
    type       enum ('FILE', 'IMAGE', 'TEXT', 'VIDEO') null,
    chat_id    varchar(255)                            not null,
    sender_id  varchar(255)                            not null,
    constraint uk_msg_chat_seq
        unique (chat_id, seq),
    constraint FKcnj2qaf5yc36v2f90jw2ipl9b
        foreign key (sender_id) references user (id),
    constraint FKmejd0ykokrbuekwwgd5a5xt8a
        foreign key (chat_id) references chat (id)
);

create index idx_msg_chat_seq
    on message (chat_id, seq);

create table if not exists notification
(
    id         bigint auto_increment
        primary key,
    created_at datetime(6)                                                                               not null,
    payload    json                                                                                      null,
    is_read    bit                                                                                       not null,
    type       enum ('COMMENT_POST', 'FRIEND_REQUEST', 'LIKE_POST', 'NEW_FRIEND', 'SYSTEM_ANNOUNCEMENT') null,
    user_id    varchar(255)                                                                              not null,
    constraint FKb0yvoep4h4k92ipon31wmdf7e
        foreign key (user_id) references user (id)
);

create index idx_notification_user_created
    on notification (user_id asc, created_at desc);

create index idx_notification_user_unread
    on notification (user_id, is_read);

create table if not exists post
(
    id         varchar(255)                                              not null
        primary key,
    content    tinytext                                                  not null,
    user_id    varchar(255)                                              not null,
    created_at datetime(6)                                               not null,
    status     enum ('PENDING', 'PUBLISHED', 'REJECTED', 'UNDER_REVIEW') null,
    constraint FKa6yymjh1buy6751sdh9fbc47u
        foreign key (user_id) references user (id)
);

create table if not exists comment
(
    id         varchar(255) not null
        primary key,
    content    varchar(255) not null,
    created_at datetime(6)  not null,
    post_id    varchar(255) not null,
    user_id    varchar(255) not null,
    constraint FK8kcum44fvpupyw6f5baccx25c
        foreign key (user_id) references user (id),
    constraint FKs1slvnkuemjsq2kj4h3vhx7i1
        foreign key (post_id) references post (id)
);

create index idx_post_created_at
    on comment (post_id, created_at);

create table if not exists post_media
(
    id        bigint auto_increment
        primary key,
    media_url varchar(255)            not null,
    type      enum ('IMAGE', 'VIDEO') not null,
    post_id   varchar(255)            not null,
    constraint FKo5e3or8sh0maaq8jy948d3tf9
        foreign key (post_id) references post (id)
);

create index idx_post
    on post_media (post_id);

create table if not exists profile
(
    user_id         varchar(255)                     not null
        primary key,
    avatar_url      varchar(255)                     null,
    bio             varchar(255)                     null,
    birthday        date                             null,
    cover_image_url varchar(255)                     null,
    full_name       varchar(255)                     null,
    gender          enum ('FEMALE', 'MALE', 'OTHER') null,
    visibility      enum ('FRIEND_ONLY', 'PUBLIC')   null,
    constraint FK6kwj5lk78pnhwor4pgosvb51r
        foreign key (user_id) references user (id)
);

create table if not exists reaction
(
    id         varchar(255) not null
        primary key,
    created_at datetime(6)  not null,
    post_id    varchar(255) not null,
    user_id    varchar(255) not null,
    constraint uk_user_post
        unique (post_id, user_id),
    constraint FKathfhl7fif9f9mggdjhg7ktdt
        foreign key (post_id) references post (id),
    constraint FKp68qgeq3telx6adl7hssrdxbw
        foreign key (user_id) references user (id)
);

create index idx_post
    on reaction (post_id);

create table if not exists user_roles
(
    user_id    varchar(255)           not null,
    roles_name enum ('ADMIN', 'USER') not null,
    primary key (user_id, roles_name),
    constraint FK55itppkw3i07do3h7qoclqd4k
        foreign key (user_id) references user (id),
    constraint FK6pmbiap985ue1c0qjic44pxlc
        foreign key (roles_name) references role (name)
);

create table if not exists reports
(
    id          varchar(255)                                                                      not null
        primary key,
    created_at  datetime(6)                                                                       not null,
    details     varchar(255)                                                                      null,
    reason      enum ('HARASSMENT', 'HATE_SPEECH', 'NUDITY', 'OTHER', 'SCAM', 'SPAM', 'VIOLENCE') not null,
    resolved_at datetime(6)                                                                       null,
    resolved_by varchar(255)                                                                      null,
    status      enum ('DISMISSED', 'PENDING', 'RESOLVED')                                         null,
    target_id   varchar(255)                                                                      not null,
    target_type enum ('COMMENT', 'POST')                                                          not null,
    reporter_id varchar(255)                                                                      not null,
    constraint FKd214gj02gt1gtw1j1q5j14hyt
        foreign key (reporter_id) references user (id)
);