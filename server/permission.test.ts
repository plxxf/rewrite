import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { createConversion, createBatchJob } from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createUserContext(userId: number, openId: string): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId,
    email: `user${userId}@example.com`,
    name: `User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("permission validation", () => {
  it("user can only access their own conversions", async () => {
    // Create conversion for user 1
    const conversion = await createConversion({
      userId: 1,
      inputFormat: "markdown",
      outputFormat: "html",
      inputFileName: "test.md",
      outputFileName: "test.html",
      inputFileKey: "test-input",
      outputFileKey: "test-output",
      inputFileUrl: "https://example.com/input",
      outputFileUrl: "https://example.com/output",
      status: "completed",
    });

    // User 1 should be able to access their own conversion
    const ctx1 = createUserContext(1, "user-1");
    const caller1 = appRouter.createCaller(ctx1);
    const result1 = await caller1.conversion.getById({ id: conversion.id });
    expect(result1.id).toBe(conversion.id);

    // User 2 should NOT be able to access user 1's conversion
    const ctx2 = createUserContext(2, "user-2");
    const caller2 = appRouter.createCaller(ctx2);
    await expect(
      caller2.conversion.getById({ id: conversion.id })
    ).rejects.toThrow("Conversion not found or access denied");
  });

  it("user can only access their own batch jobs", async () => {
    // Create batch job for user 1
    const batchJob = await createBatchJob({
      userId: 1,
      inputFormat: "markdown",
      outputFormat: "html",
      totalFiles: 1,
      completedFiles: 0,
      failedFiles: 0,
      status: "pending",
    });

    // User 1 should be able to access their own batch job
    const ctx1 = createUserContext(1, "user-1");
    const caller1 = appRouter.createCaller(ctx1);
    const result1 = await caller1.batch.getJobStatus({ jobId: batchJob.id });
    expect(result1.job.id).toBe(batchJob.id);

    // User 2 should NOT be able to access user 1's batch job
    const ctx2 = createUserContext(2, "user-2");
    const caller2 = appRouter.createCaller(ctx2);
    await expect(
      caller2.batch.getJobStatus({ jobId: batchJob.id })
    ).rejects.toThrow("Batch job not found or access denied");
  });

  it("user can only delete their own conversions", async () => {
    // Create conversion for user 1
    const conversion = await createConversion({
      userId: 1,
      inputFormat: "markdown",
      outputFormat: "html",
      inputFileName: "test.md",
      outputFileName: "test.html",
      inputFileKey: "test-input",
      outputFileKey: "test-output",
      inputFileUrl: "https://example.com/input",
      outputFileUrl: "https://example.com/output",
      status: "completed",
    });

    // User 2 should NOT be able to delete user 1's conversion
    const ctx2 = createUserContext(2, "user-2");
    const caller2 = appRouter.createCaller(ctx2);
    await expect(
      caller2.conversion.delete({ id: conversion.id })
    ).rejects.toThrow("Conversion not found or access denied");

    // User 1 should be able to delete their own conversion
    const ctx1 = createUserContext(1, "user-1");
    const caller1 = appRouter.createCaller(ctx1);
    const result = await caller1.conversion.delete({ id: conversion.id });
    expect(result.success).toBe(true);
  });
});
