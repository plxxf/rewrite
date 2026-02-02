import { runCleanup } from "./cleanupService";

/**
 * Scheduler for periodic cleanup tasks
 * Runs daily at 2:00 AM to clean up expired data
 */

let cleanupInterval: NodeJS.Timeout | null = null;

/**
 * Calculate milliseconds until next 2:00 AM
 */
function getMillisecondsUntilNextRun(): number {
  const now = new Date();
  const next = new Date();
  
  // Set to 2:00 AM
  next.setHours(2, 0, 0, 0);
  
  // If 2:00 AM has already passed today, schedule for tomorrow
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  
  return next.getTime() - now.getTime();
}

/**
 * Schedule the next cleanup run
 */
function scheduleNextCleanup() {
  const msUntilNext = getMillisecondsUntilNextRun();
  const nextRunDate = new Date(Date.now() + msUntilNext);
  
  console.log(`[Scheduler] Next cleanup scheduled for ${nextRunDate.toISOString()}`);
  
  cleanupInterval = setTimeout(async () => {
    try {
      await runCleanup();
    } catch (error) {
      console.error("[Scheduler] Cleanup task failed:", error);
    }
    
    // Schedule next run (24 hours later)
    scheduleNextCleanup();
  }, msUntilNext);
}

/**
 * Start the cleanup scheduler
 * @param runImmediately - If true, run cleanup immediately on start (useful for testing)
 */
export function startScheduler(runImmediately = false) {
  if (cleanupInterval) {
    console.warn("[Scheduler] Scheduler already running");
    return;
  }
  
  console.log("[Scheduler] Starting cleanup scheduler...");
  
  if (runImmediately) {
    console.log("[Scheduler] Running immediate cleanup...");
    runCleanup()
      .then(() => {
        console.log("[Scheduler] Immediate cleanup completed");
        scheduleNextCleanup();
      })
      .catch((error) => {
        console.error("[Scheduler] Immediate cleanup failed:", error);
        scheduleNextCleanup();
      });
  } else {
    scheduleNextCleanup();
  }
}

/**
 * Stop the cleanup scheduler
 */
export function stopScheduler() {
  if (cleanupInterval) {
    clearTimeout(cleanupInterval);
    cleanupInterval = null;
    console.log("[Scheduler] Cleanup scheduler stopped");
  }
}

/**
 * Get scheduler status
 */
export function getSchedulerStatus(): {
  running: boolean;
  nextRun: Date | null;
} {
  if (!cleanupInterval) {
    return { running: false, nextRun: null };
  }
  
  const msUntilNext = getMillisecondsUntilNextRun();
  const nextRun = new Date(Date.now() + msUntilNext);
  
  return { running: true, nextRun };
}
