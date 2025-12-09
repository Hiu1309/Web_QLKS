-- Migration script to add unique constraints for email and phone in users table
-- Run this script if your existing database doesn't have these constraints

USE hotel_db;

-- Check if constraints already exist, if not add them
ALTER TABLE `users`
  ADD UNIQUE KEY `email` (`email`) IF NOT EXISTS,
  ADD UNIQUE KEY `phone` (`phone`) IF NOT EXISTS;

-- If the above doesn't work (MySQL version issue), use these individual statements:
-- ALTER TABLE `users` ADD UNIQUE KEY `email` (`email`);
-- ALTER TABLE `users` ADD UNIQUE KEY `phone` (`phone`);
