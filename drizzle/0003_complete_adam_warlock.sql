CREATE TABLE `rate_limits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`limitType` varchar(64) NOT NULL,
	`count` int NOT NULL DEFAULT 0,
	`resetAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rate_limits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `user_limit_type_idx` ON `rate_limits` (`userId`,`limitType`);