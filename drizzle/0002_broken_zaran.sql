CREATE TABLE `batch_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`batchJobId` int NOT NULL,
	`conversionId` int,
	`fileName` varchar(255) NOT NULL,
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `batch_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `batch_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255),
	`inputFormat` varchar(50) NOT NULL,
	`outputFormat` varchar(50) NOT NULL,
	`totalFiles` int NOT NULL DEFAULT 0,
	`completedFiles` int NOT NULL DEFAULT 0,
	`failedFiles` int NOT NULL DEFAULT 0,
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`zipFileUrl` text,
	`zipFileKey` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `batch_jobs_id` PRIMARY KEY(`id`)
);
