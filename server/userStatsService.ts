import { getDb } from "./db";
import { conversions, batchJobs } from "../drizzle/schema";
import { eq, and, gte, sql, desc } from "drizzle-orm";

/**
 * 用户统计数据服务
 * 提供用户转换历史的统计分析
 */

export interface UserStats {
  totalConversions: number;
  totalBatchJobs: number;
  formatStats: Array<{
    inputFormat: string;
    outputFormat: string;
    count: number;
  }>;
  recentActivity: Array<{
    date: string;
    count: number;
  }>;
}

/**
 * 获取用户的统计数据
 */
export async function getUserStats(userId: number): Promise<UserStats> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // 获取总转换次数
  const totalConversionsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(conversions)
    .where(eq(conversions.userId, userId));
  const totalConversions = Number(totalConversionsResult[0]?.count || 0);

  // 获取总批量任务数
  const totalBatchJobsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(batchJobs)
    .where(eq(batchJobs.userId, userId));
  const totalBatchJobs = Number(totalBatchJobsResult[0]?.count || 0);

  // 获取格式使用统计（按输入输出格式分组）
  const formatStatsResult = await db
    .select({
      inputFormat: conversions.inputFormat,
      outputFormat: conversions.outputFormat,
      count: sql<number>`count(*)`,
    })
    .from(conversions)
    .where(eq(conversions.userId, userId))
    .groupBy(conversions.inputFormat, conversions.outputFormat)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  const formatStats = formatStatsResult.map((row) => ({
    inputFormat: row.inputFormat,
    outputFormat: row.outputFormat,
    count: Number(row.count),
  }));

  // 获取最近7天的活动统计
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentActivityResult = await db
    .select({
      date: sql<string>`DATE(${conversions.createdAt})`,
      count: sql<number>`count(*)`,
    })
    .from(conversions)
    .where(
      and(
        eq(conversions.userId, userId),
        gte(conversions.createdAt, sevenDaysAgo)
      )
    )
    .groupBy(sql`DATE(${conversions.createdAt})`)
    .orderBy(sql`DATE(${conversions.createdAt})`);

  const recentActivity = recentActivityResult.map((row) => ({
    date: row.date,
    count: Number(row.count),
  }));

  return {
    totalConversions,
    totalBatchJobs,
    formatStats,
    recentActivity,
  };
}

/**
 * 获取用户最常用的格式对
 */
export async function getUserFavoriteFormats(userId: number): Promise<{
  inputFormat: string;
  outputFormat: string;
} | null> {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const result = await db
    .select({
      inputFormat: conversions.inputFormat,
      outputFormat: conversions.outputFormat,
      count: sql<number>`count(*)`,
    })
    .from(conversions)
    .where(eq(conversions.userId, userId))
    .groupBy(conversions.inputFormat, conversions.outputFormat)
    .orderBy(desc(sql`count(*)`))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  return {
    inputFormat: result[0].inputFormat,
    outputFormat: result[0].outputFormat,
  };
}
