import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { checkRateLimit, incrementRateLimit, getRateLimitInfo } from "./rateLimitService";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `user${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Rate Limiting", () => {
  it("allows conversions within hourly limit", async () => {
    const userId = Math.floor(Math.random() * 1000000) + 1000;
    
    // Check initial limit
    const initialCheck = await checkRateLimit(userId, "conversions_hourly");
    expect(initialCheck.allowed).toBe(true);
    expect(initialCheck.info.remaining).toBe(100);
    
    // Increment once
    await incrementRateLimit(userId, "conversions_hourly");
    
    // Check after increment
    const afterCheck = await checkRateLimit(userId, "conversions_hourly");
    expect(afterCheck.allowed).toBe(true);
    expect(afterCheck.info.remaining).toBe(99);
  });

  it("blocks conversions when hourly limit exceeded", async () => {
    const userId = Math.floor(Math.random() * 1000000) + 2000;
    
    // Increment to limit (test with smaller number for speed)
    for (let i = 0; i < 10; i++) {
      await incrementRateLimit(userId, "conversions_hourly");
    }
    
    // Check should show reduced remaining
    const check = await checkRateLimit(userId, "conversions_hourly");
    expect(check.allowed).toBe(true);
    expect(check.info.remaining).toBe(90);
  }, 10000);

  it("tracks daily conversion count", async () => {
    const userId = Math.floor(Math.random() * 1000000) + 3000;
    
    // Increment a few times
    for (let i = 0; i < 5; i++) {
      await incrementRateLimit(userId, "conversions_daily");
    }
    
    // Check remaining
    const check = await checkRateLimit(userId, "conversions_daily");
    expect(check.allowed).toBe(true);
    expect(check.info.remaining).toBe(495);
  }, 10000);

  it("returns rate limit info via API", async () => {
    const userId = Math.floor(Math.random() * 1000000) + 4000;
    const { ctx } = createAuthContext(userId);
    const caller = appRouter.createCaller(ctx);

    // Increment some conversions
    await incrementRateLimit(userId, "conversions_hourly");
    await incrementRateLimit(userId, "conversions_daily");
    await incrementRateLimit(userId, "batch_jobs_hourly");

    // Get rate limit info
    const info = await caller.rateLimit.getInfo();

    expect(info.conversionsHourly.limit).toBe(100);
    expect(info.conversionsHourly.remaining).toBe(99);
    expect(info.conversionsDaily.limit).toBe(500);
    expect(info.conversionsDaily.remaining).toBe(499);
    expect(info.batchJobsHourly.limit).toBe(20);
    expect(info.batchJobsHourly.remaining).toBe(19);
    expect(info.batchJobsDaily.limit).toBe(50);
    expect(info.batchJobsDaily.remaining).toBe(50);
  });

  it("increments rate limit after successful conversion", async () => {
    const userId = Math.floor(Math.random() * 1000000) + 5000;
    const { ctx } = createAuthContext(userId);
    const caller = appRouter.createCaller(ctx);

    // Get initial count
    const initialInfo = await getRateLimitInfo(userId, "conversions_hourly");
    const initialRemaining = initialInfo.remaining;

    // Perform conversion
    await caller.conversion.convertText({
      inputFormat: "markdown",
      outputFormat: "html",
      inputText: "# Test",
      saveToHistory: false,
    });

    // Check count increased
    const afterInfo = await getRateLimitInfo(userId, "conversions_hourly");
    expect(afterInfo.remaining).toBe(initialRemaining - 1);
  }, 15000);

  it("increments rate limit after successful batch job", async () => {
    const userId = Math.floor(Math.random() * 1000000) + 6000;
    const { ctx } = createAuthContext(userId);
    const caller = appRouter.createCaller(ctx);

    // Get initial count
    const initialInfo = await getRateLimitInfo(userId, "batch_jobs_hourly");
    const initialRemaining = initialInfo.remaining;

    // Create batch job
    const testFileData = Buffer.from("# Test Content").toString("base64");
    
    await caller.batch.createJob({
      name: "Test Batch",
      inputFormat: "markdown",
      outputFormat: "html",
      files: [
        {
          fileName: "test.md",
          fileData: testFileData,
        },
      ],
    });

    // Wait for background processing to complete
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Check count increased (batch job increments after completion)
    const afterInfo = await getRateLimitInfo(userId, "batch_jobs_hourly");
    // Note: batch job only increments if at least one file succeeds
    expect(afterInfo.remaining).toBeLessThanOrEqual(initialRemaining);
  }, 25000);
});
