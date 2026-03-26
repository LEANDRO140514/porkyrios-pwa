CREATE TABLE `coupons` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`type` text NOT NULL,
	`value` real NOT NULL,
	`min_purchase` real,
	`max_discount` real,
	`usage_limit` integer,
	`used_count` integer DEFAULT 0 NOT NULL,
	`start_date` text,
	`end_date` text,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `coupons_code_unique` ON `coupons` (`code`);