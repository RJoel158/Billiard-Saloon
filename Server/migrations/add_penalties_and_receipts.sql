-- Add payment receipt column to payments table
ALTER TABLE `payments` 
ADD COLUMN `receipt_image` VARCHAR(500) DEFAULT NULL COMMENT 'Path to payment receipt image';

-- Create penalties table
CREATE TABLE IF NOT EXISTS `penalties` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `session_id` INT(11) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `reason` TEXT NOT NULL,
  `applied_by` INT(11) NOT NULL COMMENT 'Admin user who applied the penalty',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_penalty_session` (`session_id`),
  KEY `fk_penalty_admin` (`applied_by`),
  CONSTRAINT `fk_penalty_session` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_penalty_admin` FOREIGN KEY (`applied_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
