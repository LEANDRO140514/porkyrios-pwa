CREATE TABLE `referrals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`referrer_user_id` text NOT NULL,
	`referred_user_id` text,
	`referral_code` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`reward_coupon_id` integer,
	`created_at` text NOT NULL,
	`completed_at` text,
	FOREIGN KEY (`referrer_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`referred_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reward_coupon_id`) REFERENCES `coupons`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `referrals_referral_code_unique` ON `referrals` (`referral_code`);