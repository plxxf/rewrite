import { getDb } from "./db";
import { conversions, batchJobs, batchItems } from "../drizzle/schema";
import { lt } from "drizzle-orm";

/**
 * Data retention policy: 7 days
 * Files are automatically deleted by S3 after 7 days
 * Database records should be cleaned up accordingly
 */
const RETENTION_DAYS = 7;

/**
 * Calculate the cutoff date for data cleanup
 */
function getCutoffDate(): Date {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
  return cutoff;
}

/**
 * Clean up conversion history records older than retention period
 * @returns Number of records deleted
 */
export async function cleanupConversionHistory(): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn("[Cleanup] Database not available, skipping conversion history cleanup");
    return 0;
  }

  const cutoffDate = getCutoffDate();
  
  try {
    const result = await db
      .delete(conversions)
      .where(lt(conversions.createdAt, cutoffDate));
    
    const deletedCount = result[0]?.affectedRows ?? 0;
    console.log(`[Cleanup] Deleted ${deletedCount} conversion records older than ${cutoffDate.toISOString()}`);
    return deletedCount;
  } catch (error) {
    console.error("[Cleanup] Failed to clean up conversions:", error);
    throw error;
  }
}

/**
 * Clean up batch job items older than retention period
 * @returns Number of items deleted
 */
export async function cleanupBatchItems(): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn("[Cleanup] Database not available, skipping batch items cleanup");
    return 0;
  }

  const cutoffDate = getCutoffDate();
  
  try {
    const result = await db
      .delete(batchItems)
      .where(lt(batchItems.createdAt, cutoffDate));
    
    const deletedCount = result[0]?.affectedRows ?? 0;
    console.log(`[Cleanup] Deleted ${deletedCount} batch items older than ${cutoffDate.toISOString()}`);
    return deletedCount;
  } catch (error) {
    console.error("[Cleanup] Failed to clean up batch items:", error);
    throw error;
  }
}

/**
 * Clean up batch jobs older than retention period
 * @returns Number of jobs deleted
 */
export async function cleanupBatchJobs(): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn("[Cleanup] Database not available, skipping batch jobs cleanup");
    return 0;
  }

  const cutoffDate = getCutoffDate();
  
  try {
    const result = await db
      .delete(batchJobs)
      .where(lt(batchJobs.createdAt, cutoffDate));
    
    const deletedCount = result[0]?.affectedRows ?? 0;
    console.log(`[Cleanup] Deleted ${deletedCount} batch jobs older than ${cutoffDate.toISOString()}`);
    return deletedCount;
  } catch (error) {
    console.error("[Cleanup] Failed to clean up batch jobs:", error);
    throw error;
  }
}

/**
 * Run all cleanup tasks
 * @returns Summary of cleanup results
 */
export async function runCleanup(): Promise<{
  conversionHistoryDeleted: number;
  batchItemsDeleted: number;
  batchJobsDeleted: number;
  totalDeleted: number;
  timestamp: Date;
}> {
  console.log("[Cleanup] Starting scheduled data cleanup...");
  const startTime = Date.now();
  
  try {
    // Clean up in order: items first, then jobs, then history
    const batchItemsDeleted = await cleanupBatchItems();
    const batchJobsDeleted = await cleanupBatchJobs();
    const conversionHistoryDeleted = await cleanupConversionHistory();
    
    const totalDeleted = conversionHistoryDeleted + batchItemsDeleted + batchJobsDeleted;
    const duration = Date.now() - startTime;
    
    console.log(`[Cleanup] Completed in ${duration}ms. Total records deleted: ${totalDeleted}`);
    
    return {
      conversionHistoryDeleted,
      batchItemsDeleted,
      batchJobsDeleted,
      totalDeleted,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("[Cleanup] Cleanup failed:", error);
    throw error;
  }
}
