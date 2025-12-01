
-- Schema updated to match the actual DB dump

CREATE TABLE `billiard_tables` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `category_id` int(11) NOT NULL,
    `code` varchar(20) NOT NULL,
    `description` text DEFAULT NULL,
    `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '1=available,2=occupied,3=maintenance',
    PRIMARY KEY (`id`),
    UNIQUE KEY `code` (`code`),
    KEY `category_id` (`category_id`)
);

CREATE TABLE `dynamic_pricing` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `category_id` int(11) NOT NULL,
    `type` tinyint(4) NOT NULL COMMENT '1=peak_hour,2=weekend,3=high_demand,4=promotion,5=event',
    `percentage` decimal(5,2) NOT NULL,
    `time_start` time DEFAULT NULL,
    `time_end` time DEFAULT NULL,
    `weekday` tinyint(4) DEFAULT NULL COMMENT '1=Mon ... 7=Sun',
    `date_start` date DEFAULT NULL,
    `date_end` date DEFAULT NULL,
    `is_active` tinyint(1) DEFAULT 1,
    PRIMARY KEY (`id`),
    KEY `category_id` (`category_id`)
);

CREATE TABLE `payments` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `session_id` int(11) NOT NULL,
    `amount` decimal(10,2) NOT NULL,
    `method` tinyint(4) NOT NULL COMMENT '1=cash,2=card,3=qr,4=other',
    `created_at` datetime DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `session_id` (`session_id`)
);

CREATE TABLE `reservations` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `user_id` int(11) NOT NULL,
    `table_id` int(11) NOT NULL,
    `reservation_date` datetime NOT NULL,
    `start_time` datetime NOT NULL,
    `end_time` datetime NOT NULL,
    `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '1=pending,2=confirmed,3=cancelled,4=expired',
    `created_at` datetime DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `user_id` (`user_id`),
    KEY `table_id` (`table_id`)
);

CREATE TABLE `roles` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(50) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `name` (`name`)
);

CREATE TABLE `sessions` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `user_id` int(11) DEFAULT NULL,
    `reservation_id` int(11) DEFAULT NULL,
    `table_id` int(11) NOT NULL,
    `start_time` datetime NOT NULL,
    `end_time` datetime DEFAULT NULL,
    `session_type` tinyint(4) NOT NULL COMMENT '1=reservation,2=walk_in',
    `final_cost` decimal(10,2) DEFAULT 0.00,
    `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '1=active,2=closed,3=cancelled',
    PRIMARY KEY (`id`),
    KEY `user_id` (`user_id`),
    KEY `reservation_id` (`reservation_id`),
    KEY `table_id` (`table_id`)
);

CREATE TABLE `system_logs` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `user_id` int(11) DEFAULT NULL,
    `action` varchar(255) DEFAULT NULL,
    `created_at` datetime DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `user_id` (`user_id`)
);

CREATE TABLE `table_categories` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(50) NOT NULL,
    `description` text DEFAULT NULL,
    `base_price` decimal(10,2) NOT NULL,
    `status` tinyint(4) NOT NULL DEFAULT 1,
    PRIMARY KEY (`id`)
);

CREATE TABLE `users` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `role_id` int(11) NOT NULL,
    `first_name` varchar(50) NOT NULL,
    `last_name` varchar(50) NOT NULL,
    `email` varchar(100) NOT NULL,
    `password_hash` varchar(255) NOT NULL,
    `phone` varchar(20) DEFAULT NULL,
    `created_at` datetime DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    UNIQUE KEY `email` (`email`),
    KEY `role_id` (`role_id`)
);





