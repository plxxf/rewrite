import { eq, and, lt } from "drizzle-orm";
import { getDb } from "./db";
import { rateLimits } from "../drizzle/schema";
import {
  RATE_LIMITS,
  RateLimitType,
  RateLimitResult,
  RateLimitInfo,
  getNextHourReset,
  getNextDayReset,
  getSecondsUntilReset,
  formatResetTime,
} from "@shared/rateLimitConfig";

/**
 * 检查用户是否超过频率限制
 */
export async function checkRateLimit(
  userId: number,
  limitType: RateLimitType
): Promise<RateLimitResult> {
  const db = await getDb();
  if (!db) {
    // 如果数据库不可用，允许操作（降级策略）
    return {
      allowed: true,
      info: {
        limit: getLimit(limitType),
        remaining: getLimit(limitType),
        resetAt: getResetTime(limitType),
        resetIn: 0,
      },
    };
  }

  const limit = getLimit(limitType);
  const resetAt = getResetTime(limitType);
  const now = new Date();

  try {
    // 查找现有的限制记录
    const existing = await db
      .select()
      .from(rateLimits)
      .where(and(eq(rateLimits.userId, userId), eq(rateLimits.limitType, limitType)))
      .limit(1);

    let currentCount = 0;
    let currentResetAt = resetAt;

    if (existing.length > 0) {
      const record = existing[0];
      
      // 检查是否需要重置
      if (record!.resetAt <= now) {
        // 重置计数
        await db
          .update(rateLimits)
          .set({
            count: 0,
            resetAt: resetAt,
            updatedAt: now,
          })
          .where(eq(rateLimits.id, record!.id));
        
        currentCount = 0;
        currentResetAt = resetAt;
      } else {
        currentCount = record!.count;
        currentResetAt = record!.resetAt;
      }
    }

    const remaining = Math.max(0, limit - currentCount);
    const allowed = currentCount < limit;

    const info: RateLimitInfo = {
      limit,
      remaining,
      resetAt: currentResetAt,
      resetIn: getSecondsUntilReset(currentResetAt),
    };

    if (!allowed) {
      return {
        allowed: false,
        info,
        message: `已达到${getLimitTypeName(limitType)}限制（${limit}次）。请在${formatResetTime(info.resetIn)}后重试。`,
      };
    }

    return {
      allowed: true,
      info,
    };
  } catch (error) {
    console.error("[RateLimit] Error checking rate limit:", error);
    // 发生错误时允许操作（降级策略）
    return {
      allowed: true,
      info: {
        limit,
        remaining: limit,
        resetAt,
        resetIn: 0,
      },
    };
  }
}

/**
 * 增加用户的操作计数
 */
export async function incrementRateLimit(
  userId: number,
  limitType: RateLimitType
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const resetAt = getResetTime(limitType);
  const now = new Date();

  try {
    // 查找现有记录
    const existing = await db
      .select()
      .from(rateLimits)
      .where(and(eq(rateLimits.userId, userId), eq(rateLimits.limitType, limitType)))
      .limit(1);

    if (existing.length > 0) {
      const record = existing[0];
      
      // 检查是否需要重置
      if (record!.resetAt <= now) {
        // 重置并设置为1
        await db
          .update(rateLimits)
          .set({
            count: 1,
            resetAt: resetAt,
            updatedAt: now,
          })
          .where(eq(rateLimits.id, record!.id));
      } else {
        // 增加计数
        await db
          .update(rateLimits)
          .set({
            count: record!.count + 1,
            updatedAt: now,
          })
          .where(eq(rateLimits.id, record!.id));
      }
    } else {
      // 创建新记录
      await db.insert(rateLimits).values({
        userId,
        limitType,
        count: 1,
        resetAt,
      });
    }
  } catch (error) {
    console.error("[RateLimit] Error incrementing rate limit:", error);
  }
}

/**
 * 获取用户的频率限制信息
 */
export async function getRateLimitInfo(
  userId: number,
  limitType: RateLimitType
): Promise<RateLimitInfo> {
  const db = await getDb();
  const limit = getLimit(limitType);
  const resetAt = getResetTime(limitType);

  if (!db) {
    return {
      limit,
      remaining: limit,
      resetAt,
      resetIn: getSecondsUntilReset(resetAt),
    };
  }

  const now = new Date();

  try {
    const existing = await db
      .select()
      .from(rateLimits)
      .where(and(eq(rateLimits.userId, userId), eq(rateLimits.limitType, limitType)))
      .limit(1);

    if (existing.length === 0 || existing[0]!.resetAt <= now) {
      return {
        limit,
        remaining: limit,
        resetAt,
        resetIn: getSecondsUntilReset(resetAt),
      };
    }

    const record = existing[0]!;
    return {
      limit,
      remaining: Math.max(0, limit - record.count),
      resetAt: record.resetAt,
      resetIn: getSecondsUntilReset(record.resetAt),
    };
  } catch (error) {
    console.error("[RateLimit] Error getting rate limit info:", error);
    return {
      limit,
      remaining: limit,
      resetAt,
      resetIn: getSecondsUntilReset(resetAt),
    };
  }
}

/**
 * 清理过期的频率限制记录
 */
export async function cleanupExpiredRateLimits(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  try {
    const result = await db
      .delete(rateLimits)
      .where(lt(rateLimits.resetAt, oneDayAgo));

    const count = (result as any).rowsAffected || 0;
    console.log(`[RateLimit] Cleaned up ${count} expired rate limit records`);
    return count;
  } catch (error) {
    console.error("[RateLimit] Error cleaning up expired rate limits:", error);
    return 0;
  }
}

// Helper functions

function getLimit(limitType: RateLimitType): number {
  switch (limitType) {
    case "conversions_hourly":
      return RATE_LIMITS.CONVERSIONS_PER_HOUR;
    case "conversions_daily":
      return RATE_LIMITS.CONVERSIONS_PER_DAY;
    case "batch_jobs_hourly":
      return RATE_LIMITS.BATCH_JOBS_PER_HOUR;
    case "batch_jobs_daily":
      return RATE_LIMITS.BATCH_JOBS_PER_DAY;
    default:
      return 100;
  }
}

function getResetTime(limitType: RateLimitType): Date {
  if (limitType.endsWith("_hourly")) {
    return getNextHourReset();
  } else {
    return getNextDayReset();
  }
}

function getLimitTypeName(limitType: RateLimitType): string {
  switch (limitType) {
    case "conversions_hourly":
      return "每小时转换";
    case "conversions_daily":
      return "每天转换";
    case "batch_jobs_hourly":
      return "每小时批量转换";
    case "batch_jobs_daily":
      return "每天批量转换";
    default:
      return "操作";
  }
}
