/**
 * Concurrency control utility
 * Limits the number of concurrent async operations
 */

export class ConcurrencyLimiter {
  private maxConcurrent: number;
  private running: number = 0;
  private queue: Array<() => void> = [];

  constructor(maxConcurrent: number) {
    this.maxConcurrent = maxConcurrent;
  }

  /**
   * Execute a function with concurrency control
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Wait if we're at max concurrency
    if (this.running >= this.maxConcurrent) {
      await new Promise<void>((resolve) => {
        this.queue.push(resolve);
      });
    }

    this.running++;

    try {
      const result = await fn();
      return result;
    } finally {
      this.running--;
      
      // Process next item in queue
      const next = this.queue.shift();
      if (next) {
        next();
      }
    }
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      running: this.running,
      queued: this.queue.length,
      maxConcurrent: this.maxConcurrent,
    };
  }

  /**
   * Clear the queue
   */
  clearQueue() {
    this.queue.length = 0;
  }
}

/**
 * Process an array of items with concurrency control
 */
export async function processConcurrently<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  maxConcurrent: number
): Promise<R[]> {
  const limiter = new ConcurrencyLimiter(maxConcurrent);
  const results: R[] = [];

  await Promise.all(
    items.map(async (item, index) => {
      const result = await limiter.execute(() => processor(item, index));
      results[index] = result;
    })
  );

  return results;
}
