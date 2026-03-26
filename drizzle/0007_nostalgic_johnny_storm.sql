CREATE TABLE `postal_codes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`municipality` text,
	`state` text,
	`delivery_cost` real DEFAULT 35 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `postal_codes_code_unique` ON `postal_codes` (`code`);