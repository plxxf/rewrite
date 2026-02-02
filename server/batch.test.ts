import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
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

describe("batch.createJob", () => {
  it("creates a batch conversion job with multiple files", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create sample base64 data
    const sampleMarkdown = Buffer.from("# Test\n\nHello World").toString("base64");

    const result = await caller.batch.createJob({
      inputFormat: "markdown",
      outputFormat: "html",
      files: [
        { fileName: "test1.md", fileData: sampleMarkdown },
        { fileName: "test2.md", fileData: sampleMarkdown },
      ],
    });

    expect(result.jobId).toBeDefined();
    expect(result.totalFiles).toBe(2);
  });

  it("handles empty file list", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.batch.createJob({
      inputFormat: "markdown",
      outputFormat: "html",
      files: [],
    });

    expect(result.jobId).toBeDefined();
    expect(result.totalFiles).toBe(0);
  });
});

describe("batch.getJobStatus", () => {
  it("retrieves batch job status", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const sampleMarkdown = Buffer.from("# Test").toString("base64");

    const createResult = await caller.batch.createJob({
      inputFormat: "markdown",
      outputFormat: "html",
      files: [{ fileName: "test.md", fileData: sampleMarkdown }],
    });

    const statusResult = await caller.batch.getJobStatus({
      jobId: createResult.jobId,
    });

    expect(statusResult.job).toBeDefined();
    expect(statusResult.job.id).toBe(createResult.jobId);
    expect(statusResult.items).toBeDefined();
    expect(Array.isArray(statusResult.items)).toBe(true);
  });
});
