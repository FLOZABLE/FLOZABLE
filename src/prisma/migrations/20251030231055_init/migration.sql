-- CreateTable
CREATE TABLE `users` (
    `user_id` VARCHAR(10) NOT NULL,
    `name` VARCHAR(40) NOT NULL,
    `email` VARCHAR(60) NOT NULL,
    `timezone` VARCHAR(40) NOT NULL DEFAULT 'UTC',
    `created_at` INTEGER NOT NULL,
    `type` SMALLINT NOT NULL DEFAULT 0,
    `key_salt` VARCHAR(64) NULL,
    `hashed_password` VARCHAR(64) NOT NULL,
    `hashed_password_type` VARCHAR(10) NOT NULL DEFAULT 'pbkdf2',
    `salt` VARCHAR(64) NULL,
    `subscription` BOOLEAN NULL DEFAULT false,
    `google_refresh_token` VARCHAR(150) NULL,
    `notification_endpoint` VARCHAR(256) NULL,
    `notification_keys` VARCHAR(150) NULL,
    `stripe_id` VARCHAR(25) NULL,
    `spotify_refresh_token` VARCHAR(150) NULL,
    `verified` BOOLEAN NOT NULL DEFAULT false,
    `level` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    `current_streak` SMALLINT UNSIGNED NOT NULL DEFAULT 0,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chatroom_members` (
    `chatroom_id` VARCHAR(10) NOT NULL,
    `user_id` VARCHAR(10) NOT NULL,

    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`chatroom_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chatroom_messages` (
    `message_id` VARCHAR(10) NOT NULL,
    `chatroom_id` VARCHAR(10) NOT NULL,
    `user_id` VARCHAR(10) NOT NULL,
    `message` TEXT NOT NULL,
    `sent_at` INTEGER NOT NULL,

    INDEX `chatroom_id`(`chatroom_id`),
    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`message_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chatrooms` (
    `chatroom_id` VARCHAR(10) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `type` ENUM('group', 'room') NOT NULL DEFAULT 'group',
    `group_id` VARCHAR(10) NULL,

    PRIMARY KEY (`chatroom_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `devices` (
    `device_id` VARCHAR(40) NOT NULL,
    `user_id` VARCHAR(10) NOT NULL,
    `created_at` INTEGER NOT NULL,
    `name` VARCHAR(30) NULL,
    `brand` VARCHAR(30) NULL,
    `token` VARCHAR(32) NOT NULL,
    `notification_token` VARCHAR(60) NULL,

    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`device_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `friends` (
    `friendship_id` VARCHAR(10) NOT NULL,
    `user_id` VARCHAR(10) NOT NULL,
    `friend_id` VARCHAR(10) NOT NULL,
    `status` ENUM('pending', 'accepted') NOT NULL DEFAULT 'pending',
    `date` INTEGER NOT NULL,

    INDEX `friend_id`(`friend_id`),
    UNIQUE INDEX `unique_friend_pair`(`user_id`, `friend_id`),
    PRIMARY KEY (`friendship_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `group_likes` (
    `group_id` VARCHAR(10) NOT NULL,
    `user_id` VARCHAR(10) NOT NULL,

    INDEX `group_id`(`group_id`),
    PRIMARY KEY (`user_id`, `group_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `group_members` (
    `group_id` VARCHAR(10) NOT NULL,
    `user_id` VARCHAR(10) NOT NULL,
    `joined_at` INTEGER NOT NULL,

    INDEX `group_id`(`group_id`),
    PRIMARY KEY (`user_id`, `group_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `groups` (
    `group_id` VARCHAR(10) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `leader` VARCHAR(10) NOT NULL,
    `visibility` SMALLINT NOT NULL DEFAULT 1,
    `password` VARCHAR(255) NULL,
    `description` VARCHAR(1000) NOT NULL,
    `created_at` INTEGER NOT NULL,
    `max_members` SMALLINT NOT NULL,
    `tags` VARCHAR(300) NOT NULL,
    `color` VARCHAR(20) NULL,
    `goal_hr` SMALLINT NOT NULL,

    INDEX `group_id`(`group_id`),
    INDEX `leader`(`leader`),
    PRIMARY KEY (`group_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `notification_id` VARCHAR(10) NOT NULL,
    `user_id` VARCHAR(10) NOT NULL,
    `sender_id` VARCHAR(10) NULL,
    `group_id` VARCHAR(10) NULL,
    `friend_request_id` VARCHAR(10) NULL,
    `sent_at` INTEGER NOT NULL,
    `title` VARCHAR(100) NULL,
    `message` VARCHAR(300) NULL,
    `type` ENUM('friend_request', 'friend_accepted', 'group_invite', 'chat_request', 'global') NOT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,

    INDEX `idx_notifications_user_id`(`user_id`),
    INDEX `idx_notifications_sender_id`(`sender_id`),
    INDEX `idx_notifications_group_id`(`group_id`),
    PRIMARY KEY (`notification_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ranking_details` (
    `ranking_id` VARCHAR(10) NOT NULL,
    `user_id` VARCHAR(10) NOT NULL,
    `rank` INTEGER NOT NULL,
    `study_time` INTEGER NOT NULL,

    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`ranking_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rankings` (
    `ranking_id` VARCHAR(10) NOT NULL,
    `date` INTEGER NOT NULL,
    `timezone` VARCHAR(40) NOT NULL,
    `mode` VARCHAR(10) NOT NULL,
    `length` INTEGER NOT NULL,

    UNIQUE INDEX `rankings_date_timezone_mode_key`(`date`, `timezone`, `mode`),
    PRIMARY KEY (`ranking_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subjects` (
    `subject_id` VARCHAR(10) NOT NULL,
    `name` VARCHAR(20) NOT NULL,
    `user_id` VARCHAR(10) NOT NULL,
    `color` VARCHAR(20) NOT NULL,
    `created_at` INTEGER NOT NULL,

    UNIQUE INDEX `user_id`(`user_id`, `name`),
    PRIMARY KEY (`subject_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subject_timelines` (
    `subject_id` VARCHAR(10) NOT NULL,
    `start_time` INTEGER NOT NULL,
    `duration` SMALLINT UNSIGNED NOT NULL,

    INDEX `subject_id`(`subject_id`),
    UNIQUE INDEX `subject_timelines_subject_id_start_time_key`(`subject_id`, `start_time`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `theme_likes` (
    `theme_id` VARCHAR(10) NOT NULL,
    `user_id` VARCHAR(10) NOT NULL,

    INDEX `theme_id`(`theme_id`),
    PRIMARY KEY (`user_id`, `theme_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `themes` (
    `theme_id` VARCHAR(10) NOT NULL,
    `user_id` VARCHAR(20) NOT NULL,
    `video_id` VARCHAR(11) NOT NULL,
    `name` VARCHAR(40) NOT NULL,
    `description` VARCHAR(700) NOT NULL,
    `tags` VARCHAR(300) NOT NULL DEFAULT '',

    INDEX `theme_id`(`theme_id`),
    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`theme_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_themes` (
    `user_id` VARCHAR(20) NOT NULL,
    `theme_id` VARCHAR(10) NOT NULL,
    `category_id` SMALLINT NULL,

    INDEX `theme_id`(`theme_id`),
    PRIMARY KEY (`user_id`, `theme_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `website_settings` (
    `user_id` VARCHAR(10) NOT NULL,
    `website` VARCHAR(20) NOT NULL,
    `block` BOOLEAN NOT NULL,
    `study_block` BOOLEAN NOT NULL,
    `timer` BOOLEAN NOT NULL,
    `study_timer` BOOLEAN NOT NULL,

    UNIQUE INDEX `unique_setting_pair`(`user_id`, `website`),
    PRIMARY KEY (`user_id`, `website`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `website_usage` (
    `user_id` VARCHAR(10) NOT NULL,
    `website` VARCHAR(20) NOT NULL,
    `visits` SMALLINT NOT NULL,
    `duration` SMALLINT NOT NULL,
    `date` VARCHAR(10) NOT NULL,

    PRIMARY KEY (`user_id`, `website`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `chatroom_members` ADD CONSTRAINT `chatroom_members_chatroom_id_fkey` FOREIGN KEY (`chatroom_id`) REFERENCES `chatrooms`(`chatroom_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chatroom_members` ADD CONSTRAINT `chatroom_members_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chatroom_messages` ADD CONSTRAINT `chatroom_messages_chatroom_id_fkey` FOREIGN KEY (`chatroom_id`) REFERENCES `chatrooms`(`chatroom_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chatroom_messages` ADD CONSTRAINT `chatroom_messages_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chatrooms` ADD CONSTRAINT `chatrooms_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `groups`(`group_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `devices` ADD CONSTRAINT `devices_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `friends` ADD CONSTRAINT `friends_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `friends` ADD CONSTRAINT `friends_friend_id_fkey` FOREIGN KEY (`friend_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `group_likes` ADD CONSTRAINT `group_likes_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `groups`(`group_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `group_likes` ADD CONSTRAINT `group_likes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `group_members` ADD CONSTRAINT `group_members_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `groups`(`group_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `group_members` ADD CONSTRAINT `group_members_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `groups` ADD CONSTRAINT `groups_leader_fkey` FOREIGN KEY (`leader`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `groups`(`group_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_friend_request_id_fkey` FOREIGN KEY (`friend_request_id`) REFERENCES `friends`(`friendship_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ranking_details` ADD CONSTRAINT `ranking_details_ranking_id_fkey` FOREIGN KEY (`ranking_id`) REFERENCES `rankings`(`ranking_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ranking_details` ADD CONSTRAINT `ranking_details_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subjects` ADD CONSTRAINT `subjects_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subject_timelines` ADD CONSTRAINT `subject_timelines_subject_id_fkey` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`subject_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `theme_likes` ADD CONSTRAINT `theme_likes_theme_id_fkey` FOREIGN KEY (`theme_id`) REFERENCES `themes`(`theme_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `theme_likes` ADD CONSTRAINT `theme_likes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `themes` ADD CONSTRAINT `themes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_themes` ADD CONSTRAINT `user_themes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_themes` ADD CONSTRAINT `user_themes_theme_id_fkey` FOREIGN KEY (`theme_id`) REFERENCES `themes`(`theme_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `website_settings` ADD CONSTRAINT `website_settings_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `website_usage` ADD CONSTRAINT `website_usage_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
