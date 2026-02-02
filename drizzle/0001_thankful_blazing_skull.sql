CREATE TABLE `conversions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`inputFormat` varchar(50) NOT NULL,
	`outputFormat` varchar(50) NOT NULL,
	`inputFileName` varchar(255),
	`outputFileName` varchar(255),
	`inputFileUrl` text,
	`outputFileUrl` text,
	`inputFileKey` varchar(500),
	`outputFileKey` varchar(500),
	`inputText` text,
	`outputText` text,
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversions_id` PRIMARY KEY(`id`)
);
