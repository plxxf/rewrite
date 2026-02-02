/**
 * 频率限制配置
 * 用于防止系统滥用和保护服务器资源
 */

export const RATE_LIMITS = {
  // 每小时转换次数限制
  CONVERSIONS_PER_HOUR: 100,
  
  // 每天转换次数限制
  CONVERSIONS_PER_DAY: 500,
  
  // 每小时批量转换次数限制
  BATCH_JOBS_PER_HOUR: 20,
  
  // 每天批量转换次数限制
  BATCH_JOBS_PER_DAY: 50,
} as const;

export type RateLimitType = 
  | "conversions_hourly" 
  | "conversions_daily" 
  | "batch_jobs_hourly" 
  | "batch_jobs_daily";

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: Date;
  resetIn: number; // seconds until reset
}

export interface RateLimitResult {
  allowed: boolean;
  info: RateLimitInfo;
  message?: string;
}

/**
 * 计算距离重置时间还有多少秒
 */
export function getSecondsUntilReset(resetAt: Date): number {
  return Math.max(0, Math.ceil((resetAt.getTime() - Date.now()) / 1000));
}

/**
 * 格式化重置时间提示
 */
export function formatResetTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} 秒`;
  } else if (seconds < 3600) {
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} 分钟`;
  } else {
    const hours = Math.ceil(seconds / 3600);
    return `${hours} 小时`;
  }
}

/**
 * 获取下一个整点时间（用于每小时限制重置）
 */
export function getNextHourReset(): Date {
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(now.getHours() + 1, 0, 0, 0);
  return nextHour;
}

/**
 * 获取下一个午夜时间（用于每天限制重置）
 */
export function getNextDayReset(): Date {
  const now = new Date();
  const nextDay = new Date(now);
  nextDay.setDate(now.getDate() + 1);
  nextDay.setHours(0, 0, 0, 0);
  return nextDay;
}
