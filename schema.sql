SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE DATABASE IF NOT EXISTS `krishibazar` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `krishibazar`;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS
  `role_permissions`,
  `admin_permissions`,
  `admin_roles`,
  `permissions`,
  `roles`,
  `product_orders`,
  `products`,
  `project_updates`,
  `investment_reports`,
  `investments`,
  `projects`,
  `categories`,
  `chat_messages`,
  `tbl_admins`,
  `users`,
  `verification_codes`;

SET FOREIGN_KEY_CHECKS = 1;




CREATE TABLE `admin_permissions` (
  `admin_id` bigint unsigned NOT NULL,
  `permission_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`admin_id`,`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `admin_roles` (
  `admin_id` bigint unsigned NOT NULL,
  `role_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`admin_id`,`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ;





CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `icon` varchar(100) DEFAULT 'crop',
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_category_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4;

CREATE TABLE `chat_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sender_id` int NOT NULL,
  `sender_type` enum('user','admin') NOT NULL,
  `receiver_id` int DEFAULT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_chat_messages_sender` (`sender_id`),
  KEY `idx_chat_messages_receiver` (`receiver_id`),
  KEY `idx_chat_messages_created` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4;


CREATE TABLE `investment_reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `report_period` enum('monthly','quarterly','final') NOT NULL,
  `report_date` date NOT NULL,
  `financial_summary` json DEFAULT NULL,
  `project_metrics` json DEFAULT NULL,
  `farmer_feedback` text,
  `issues_challenges` text,
  `next_steps` text,
  `photos` json DEFAULT NULL,
  `videos` json DEFAULT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_investment_reports_project_id` (`project_id`),
  KEY `idx_investment_reports_report_period` (`report_period`),
  KEY `idx_investment_reports_report_date` (`report_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `investments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `project_id` int NOT NULL,
  `units_invested` int NOT NULL,
  `amount_per_unit` decimal(10,2) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `expected_return_amount` decimal(10,2) NOT NULL,
  `investment_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','confirmed','cancelled','completed') NOT NULL DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_reference` varchar(255) DEFAULT NULL,
  `payment_status` enum('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  `payment_date` timestamp NULL DEFAULT NULL,
  `maturity_date` timestamp NULL DEFAULT NULL,
  `return_received` decimal(10,2) DEFAULT '0.00',
  `return_date` timestamp NULL DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_investments_user_id` (`user_id`),
  KEY `idx_investments_project_id` (`project_id`),
  KEY `idx_investments_status` (`status`),
  KEY `idx_investments_payment_status` (`payment_status`),
  KEY `idx_investments_investment_date` (`investment_date`),
  CONSTRAINT `investments_chk_1` CHECK ((`units_invested` > 0)),
  CONSTRAINT `investments_chk_2` CHECK ((`amount_per_unit` > 0)),
  CONSTRAINT `investments_chk_3` CHECK ((`total_amount` > 0)),
  CONSTRAINT `investments_chk_4` CHECK ((`expected_return_amount` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;




CREATE TABLE `permissions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `permission_key` varchar(100) NOT NULL,
  `label` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permission_key` (`permission_key`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;


CREATE TABLE `product_orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `order_quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `order_status` enum('pending','confirmed','processing','shipped','completed','cancelled') NOT NULL DEFAULT 'pending',
  `customer_name` varchar(255) DEFAULT NULL,
  `customer_phone` varchar(20) DEFAULT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `delivery_address` text,
  `notes` text,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_status` enum('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  `confirmed_by` bigint DEFAULT NULL,
  `confirmed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_orders_user` (`user_id`),
  KEY `idx_orders_product` (`product_id`),
  KEY `idx_orders_status` (`order_status`),
  KEY `idx_orders_payment_status` (`payment_status`),
  KEY `idx_orders_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;


--
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` enum('product','supply') DEFAULT 'product',
  `category` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int DEFAULT '0',
  `unit` varchar(50) NOT NULL DEFAULT 'per kg',
  `min_order` decimal(10,2) NOT NULL,
  `max_order` decimal(10,2) DEFAULT NULL,
  `product_images` text,
  `in_stock` tinyint(1) DEFAULT '1',
  `description` text,
  `nutritional_info` text,
  `harvest_date` date DEFAULT NULL,
  `shelf_life` varchar(100) DEFAULT NULL,
  `farmer` varchar(255) DEFAULT NULL,
  `certifications` text,
  `rating` decimal(3,2) DEFAULT '0.00',
  `reviews` int DEFAULT '0',
  `created_by` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_products_category` (`category`),
  KEY `idx_products_in_stock` (`in_stock`),
  KEY `idx_products_created_by` (`created_by`),
  KEY `idx_products_created_at` (`created_at`),
  KEY `idx_products_name` (`name`),
  KEY `idx_products_type` (`type`),
  CONSTRAINT `products_chk_1` CHECK ((`price` >= 0)),
  CONSTRAINT `products_chk_2` CHECK ((`min_order` >= 0)),
  CONSTRAINT `products_chk_3` CHECK (((`rating` >= 0) and (`rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;


CREATE TABLE `project_updates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `update_type` enum('progress','financial','milestone','general','harvest') NOT NULL,
  `media_files` json DEFAULT NULL,
  `milestone_status` varchar(100) DEFAULT NULL,
  `financial_data` json DEFAULT NULL,
  `farmer_notes` text,
  `impact_metrics` json DEFAULT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_project_updates_project_id` (`project_id`),
  KEY `idx_project_updates_update_type` (`update_type`),
  KEY `idx_project_updates_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;

CREATE TABLE `projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `farmer_name` varchar(255) NOT NULL,
  `farmer_phone` varchar(20) NOT NULL,
  `farmer_address` text NOT NULL,
  `nid_card_front` varchar(255) DEFAULT NULL,
  `nid_card_back` varchar(255) DEFAULT NULL,
  `project_name` varchar(255) NOT NULL,
  `per_unit_price` decimal(10,2) NOT NULL,
  `total_returnable_per_unit` decimal(10,2) NOT NULL,
  `project_duration` int NOT NULL,
  `category_id` int DEFAULT NULL,
  `total_units` int NOT NULL,
  `why_fund_with_krishibazar` text NOT NULL,
  `earning_percentage` decimal(5,2) NOT NULL,
  `status` enum('pending','approved','rejected','running','completed') NOT NULL DEFAULT 'pending',
  `created_by` int NOT NULL,
  `approved_by` int DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `project_images` text,
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_projects_status` (`status`),
  KEY `idx_projects_created_by` (`created_by`),
  KEY `idx_projects_created_at` (`created_at`),
  KEY `idx_projects_farmer_name` (`farmer_name`),
  KEY `idx_projects_project_name` (`project_name`),
  KEY `idx_projects_status_started` (`status`,`started_at`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `projects_chk_1` CHECK ((`per_unit_price` >= 0)),
  CONSTRAINT `projects_chk_2` CHECK ((`total_returnable_per_unit` >= 0)),
  CONSTRAINT `projects_chk_3` CHECK ((`project_duration` > 0)),
  CONSTRAINT `projects_chk_4` CHECK ((`total_units` > 0)),
  CONSTRAINT `projects_chk_5` CHECK (((`earning_percentage` >= 0) and (`earning_percentage` <= 100)))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;

CREATE TABLE `role_permissions` (
  `role_id` bigint unsigned NOT NULL,
  `permission_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `permission_id` (`permission_id`),
  CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `roles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tbl_admins` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;



CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `nid_front` varchar(255) DEFAULT NULL,
  `nid_back` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `is_approved` int DEFAULT '0',
  `email_verified_at` datetime DEFAULT NULL,
  `phone_verified_at` datetime DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;


CREATE TABLE `verification_codes` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned DEFAULT NULL,
  `otp_code` varchar(10) NOT NULL,
  `verification_type` enum('registration','password_reset','email_change','phone_change') NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4;


-- Seed data for local development/import via XAMPP
START TRANSACTION;

-- Roles
INSERT INTO `roles` (`id`, `name`) VALUES
  (1, 'Admin'),
  (2, 'Manager')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Permissions
INSERT INTO `permissions` (`id`, `permission_key`, `label`) VALUES
  (1, 'products.read', 'Read products'),
  (2, 'products.write', 'Create/Update products'),
  (3, 'orders.manage', 'Manage orders'),
  (4, 'projects.manage', 'Manage projects'),
  (5, 'users.manage', 'Manage users')
ON DUPLICATE KEY UPDATE `permission_key` = VALUES(`permission_key`), `label` = VALUES(`label`);

-- Role to permission mapping
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`) VALUES
  (1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
  (2, 1), (2, 3);

-- Admin user (password is bcrypt for "password")
INSERT INTO `tbl_admins` (`id`, `name`, `username`, `email`, `password`, `created_at`, `updated_at`) VALUES
  (1, 'Super Admin', 'admin', 'admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW(), NOW())
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`), `username` = VALUES(`username`);

-- Link admin to roles (if your app uses it)
INSERT IGNORE INTO `admin_roles` (`admin_id`, `role_id`) VALUES (1, 1);

-- Categories
INSERT INTO `categories` (`id`, `name`, `icon`, `description`, `is_active`, `created_by`) VALUES
  (1, 'Vegetables', 'eco', 'Fresh farm vegetables', 1, 1),
  (2, 'Fruits', 'local_florist', 'Seasonal fruits', 1, 1)
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `icon` = VALUES(`icon`), `is_active` = VALUES(`is_active`);

-- Site user
INSERT INTO `users` (
  `id`, `first_name`, `last_name`, `phone`, `email`, `password`, `is_verified`, `is_approved`, `created_at`, `updated_at`
) VALUES (
  1, 'Test', 'User', '+8801000000000', 'user@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 1, NOW(), NOW()
) ON DUPLICATE KEY UPDATE `email` = VALUES(`email`), `phone` = VALUES(`phone`);

-- Products
INSERT INTO `products` (
  `id`, `name`, `type`, `category`, `price`, `quantity`, `unit`, `min_order`, `max_order`, `product_images`, `in_stock`, `description`, `rating`, `reviews`, `created_by`, `created_at`, `updated_at`
) VALUES (
  1, 'Tomato', 'product', 'Vegetables', 60.00, 100, 'per kg', 1.00, 20.00, NULL, 1, 'Fresh organic tomatoes', 4.50, 10, 1, NOW(), NOW()
) ON DUPLICATE KEY UPDATE `price` = VALUES(`price`), `quantity` = VALUES(`quantity`), `in_stock` = VALUES(`in_stock`);

-- Projects
INSERT INTO `projects` (
  `id`, `farmer_name`, `farmer_phone`, `farmer_address`, `project_name`, `per_unit_price`, `total_returnable_per_unit`, `project_duration`, `category_id`, `total_units`, `why_fund_with_krishibazar`, `earning_percentage`, `status`, `created_by`, `created_at`, `updated_at`
) VALUES (
  1, 'Abdul Karim', '+8801700000000', 'Rajshahi, Bangladesh', 'Greenhouse Tomato Expansion', 1000.00, 1150.00, 6, 1, 500, 'Support local farmer to expand greenhouse tomato production with higher yield.', 15.00, 'approved', 1, NOW(), NOW()
) ON DUPLICATE KEY UPDATE `status` = VALUES(`status`), `total_units` = VALUES(`total_units`);

-- Project update
INSERT INTO `project_updates` (
  `id`, `project_id`, `title`, `description`, `update_type`, `created_by`, `created_at`, `updated_at`
) VALUES (
  1, 1, 'Seedlings Transplanted', 'All seedlings have been transplanted to the greenhouse.', 'progress', 1, NOW(), NOW()
) ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `description` = VALUES(`description`);

-- Investment
INSERT INTO `investments` (
  `id`, `user_id`, `project_id`, `units_invested`, `amount_per_unit`, `total_amount`, `expected_return_amount`, `investment_date`, `status`, `payment_status`, `created_at`, `updated_at`
) VALUES (
  1, 1, 1, 5, 1000.00, 5000.00, 5750.00, NOW(), 'confirmed', 'paid', NOW(), NOW()
) ON DUPLICATE KEY UPDATE `status` = VALUES(`status`), `payment_status` = VALUES(`payment_status`);

-- Investment report
INSERT INTO `investment_reports` (
  `id`, `project_id`, `report_period`, `report_date`, `financial_summary`, `project_metrics`, `created_by`, `created_at`, `updated_at`
) VALUES (
  1, 1, 'monthly', CURDATE(), JSON_OBJECT('revenue', 120000, 'expenses', 80000), JSON_OBJECT('yield_kg', 1500), 1, NOW(), NOW()
) ON DUPLICATE KEY UPDATE `report_date` = VALUES(`report_date`);

-- Order
INSERT INTO `product_orders` (
  `id`, `user_id`, `product_id`, `order_quantity`, `unit_price`, `total_price`, `order_status`, `customer_name`, `customer_phone`, `created_at`, `updated_at`
) VALUES (
  1, 1, 1, 3, 60.00, 180.00, 'confirmed', 'Test User', '+8801000000000', NOW(), NOW()
) ON DUPLICATE KEY UPDATE `order_status` = VALUES(`order_status`);

-- Chat message
INSERT INTO `chat_messages` (`id`, `sender_id`, `sender_type`, `receiver_id`, `message`, `is_read`, `created_at`, `updated_at`) VALUES
  (1, 1, 'user', NULL, 'Hello, I have a question about my order.', 0, NOW(), NOW())
ON DUPLICATE KEY UPDATE `message` = VALUES(`message`);

-- Verification code
INSERT INTO `verification_codes` (`id`, `user_id`, `otp_code`, `verification_type`, `expires_at`, `created_at`, `updated_at`) VALUES
  (1, 1, '123456', 'registration', DATE_ADD(NOW(), INTERVAL 10 MINUTE), NOW(), NOW())
ON DUPLICATE KEY UPDATE `otp_code` = VALUES(`otp_code`), `expires_at` = VALUES(`expires_at`);

COMMIT;

