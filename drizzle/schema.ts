import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Conversion history table to track user's document conversions
 */
export const conversions = mysqlTable("conversions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  inputFormat: varchar("inputFormat", { length: 50 }).notNull(),
  outputFormat: varchar("outputFormat", { length: 50 }).notNull(),
  inputFileName: varchar("inputFileName", { length: 255 }),
  outputFileName: varchar("outputFileName", { length: 255 }),
  inputFileUrl: text("inputFileUrl"),
  outputFileUrl: text("outputFileUrl"),
  inputFileKey: varchar("inputFileKey", { length: 500 }),
  outputFileKey: varchar("outputFileKey", { length: 500 }),
  inputText: text("inputText"),
  outputText: text("outputText"),
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conversion = typeof conversions.$inferSelect;
export type InsertConversion = typeof conversions.$inferInsert;

/**
 * Batch conversion jobs table to track multiple file conversions
 */
export const batchJobs = mysqlTable("batch_jobs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }),
  inputFormat: varchar("inputFormat", { length: 50 }).notNull(),
  outputFormat: varchar("outputFormat", { length: 50 }).notNull(),
  totalFiles: int("totalFiles").notNull().default(0),
  completedFiles: int("completedFiles").notNull().default(0),
  failedFiles: int("failedFiles").notNull().default(0),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  zipFileUrl: text("zipFileUrl"),
  zipFileKey: varchar("zipFileKey", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BatchJob = typeof batchJobs.$inferSelect;
export type InsertBatchJob = typeof batchJobs.$inferInsert;

/**
 * Batch conversion items - individual files in a batch job
 */
export const batchItems = mysqlTable("batch_items", {
  id: int("id").autoincrement().primaryKey(),
  batchJobId: int("batchJobId").notNull(),
  conversionId: int("conversionId"),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BatchItem = typeof batchItems.$inferSelect;
export type InsertBatchItem = typeof batchItems.$inferInsert;
