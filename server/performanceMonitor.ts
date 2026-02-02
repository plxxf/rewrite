/**
 * Performance monitoring service
 * Tracks conversion times, file sizes, and system metrics
 */

export interface ConversionMetrics {
  userId: number;
  inputFormat: string;
  outputFormat: string;
  inputSize: number; // in bytes
  outputSize: number; // in bytes
  conversionTime: number; // in milliseconds
  success: boolean;
  errorMessage?: string;
  timestamp: Date;
}

export interface PerformanceStats {
  totalConversions: number;
  successfulConversions: number;
  failedConversions: number;
  averageConversionTime: number;
  averageInputSize: number;
  averageOutputSize: number;
  formatStats: Record<string, {
    count: number;
    avgTime: number;
    avgSize: number;
  }>;
}

// In-memory storage for metrics (in production, use a database or time-series DB)
const metricsBuffer: ConversionMetrics[] = [];
const MAX_BUFFER_SIZE = 1000;

/**
 * Record a conversion metric
 */
export function recordConversionMetric(metric: ConversionMetrics) {
  metricsBuffer.push(metric);

  // Keep buffer size manageable
  if (metricsBuffer.length > MAX_BUFFER_SIZE) {
    metricsBuffer.shift();
  }

  // Log metric
  console.log(
    `[Performance] Conversion ${metric.success ? "succeeded" : "failed"}: ` +
    `${metric.inputFormat} → ${metric.outputFormat}, ` +
    `${(metric.inputSize / 1024).toFixed(2)}KB → ${(metric.outputSize / 1024).toFixed(2)}KB, ` +
    `${metric.conversionTime}ms`
  );
}

/**
 * Get performance statistics
 */
export function getPerformanceStats(
  timeRangeMinutes?: number
): PerformanceStats {
  let metrics = metricsBuffer;

  // Filter by time range if specified
  if (timeRangeMinutes) {
    const cutoffTime = new Date(Date.now() - timeRangeMinutes * 60 * 1000);
    metrics = metrics.filter((m) => m.timestamp >= cutoffTime);
  }

  if (metrics.length === 0) {
    return {
      totalConversions: 0,
      successfulConversions: 0,
      failedConversions: 0,
      averageConversionTime: 0,
      averageInputSize: 0,
      averageOutputSize: 0,
      formatStats: {},
    };
  }

  const successful = metrics.filter((m) => m.success);
  const failed = metrics.filter((m) => !m.success);

  // Calculate averages
  const avgConversionTime =
    successful.reduce((sum, m) => sum + m.conversionTime, 0) /
    (successful.length || 1);
  const avgInputSize =
    metrics.reduce((sum, m) => sum + m.inputSize, 0) / metrics.length;
  const avgOutputSize =
    successful.reduce((sum, m) => sum + m.outputSize, 0) /
    (successful.length || 1);

  // Calculate format-specific stats
  const formatStats: Record<string, {
    count: number;
    avgTime: number;
    avgSize: number;
  }> = {};

  successful.forEach((m) => {
    const key = `${m.inputFormat}->${m.outputFormat}`;
    if (!formatStats[key]) {
      formatStats[key] = { count: 0, avgTime: 0, avgSize: 0 };
    }
    formatStats[key].count++;
    formatStats[key].avgTime += m.conversionTime;
    formatStats[key].avgSize += m.outputSize;
  });

  // Calculate averages for format stats
  Object.keys(formatStats).forEach((key) => {
    const stats = formatStats[key];
    stats.avgTime = stats.avgTime / stats.count;
    stats.avgSize = stats.avgSize / stats.count;
  });

  return {
    totalConversions: metrics.length,
    successfulConversions: successful.length,
    failedConversions: failed.length,
    averageConversionTime: Math.round(avgConversionTime),
    averageInputSize: Math.round(avgInputSize),
    averageOutputSize: Math.round(avgOutputSize),
    formatStats,
  };
}

/**
 * Clear all metrics
 */
export function clearMetrics() {
  metricsBuffer.length = 0;
  console.log("[Performance] Metrics cleared");
}

/**
 * Measure execution time of an async function
 */
export async function measureTime<T>(
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const startTime = Date.now();
  const result = await fn();
  const duration = Date.now() - startTime;
  return { result, duration };
}
