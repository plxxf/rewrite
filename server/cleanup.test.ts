import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { getSchedulerStatus } from "./scheduler";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
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

  return ctx;
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
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

  return ctx;
}

describe("cleanup management", () => {
  it("admin can get scheduler status", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const status = await caller.cleanup.getStatus();

    expect(status).toHaveProperty("running");
    expect(typeof status.running).toBe("boolean");
    
    if (status.running) {
      expect(status.nextRun).toBeInstanceOf(Date);
    } else {
      expect(status.nextRun).toBeNull();
    }
  });

  it("regular user cannot get scheduler status", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.cleanup.getStatus()).rejects.toThrow("Only admins can view cleanup status");
  });

  it("admin can manually trigger cleanup", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cleanup.runNow();

    expect(result).toHaveProperty("conversionHistoryDeleted");
    expect(result).toHaveProperty("batchItemsDeleted");
    expect(result).toHaveProperty("batchJobsDeleted");
    expect(result).toHaveProperty("totalDeleted");
    expect(result).toHaveProperty("timestamp");
    
    expect(typeof result.conversionHistoryDeleted).toBe("number");
    expect(typeof result.batchItemsDeleted).toBe("number");
    expect(typeof result.batchJobsDeleted).toBe("number");
    expect(typeof result.totalDeleted).toBe("number");
    expect(result.timestamp).toBeInstanceOf(Date);
    
    expect(result.conversionHistoryDeleted).toBeGreaterThanOrEqual(0);
    expect(result.batchItemsDeleted).toBeGreaterThanOrEqual(0);
    expect(result.batchJobsDeleted).toBeGreaterThanOrEqual(0);
  });

  it("regular user cannot manually trigger cleanup", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.cleanup.runNow()).rejects.toThrow("Only admins can trigger cleanup");
  });

  it("scheduler status function returns correct format", () => {
    const status = getSchedulerStatus();

    expect(status).toHaveProperty("running");
    expect(status).toHaveProperty("nextRun");
    expect(typeof status.running).toBe("boolean");
    
    if (status.nextRun !== null) {
      expect(status.nextRun).toBeInstanceOf(Date);
    }
  });
});
