ALTER TABLE `categories` ADD COLUMN `image_public_id` text;
--> statement-breakpoint
ALTER TABLE `categories` ADD COLUMN `image_size` integer;
--> statement-breakpoint
ALTER TABLE `categories` ADD COLUMN `updated_at` text;
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `image_public_id` text;
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `image_size` integer;
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `updated_at` text;
