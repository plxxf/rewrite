import { describe, expect, it, beforeEach } from "vitest";
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

describe("conversion.getSupportedFormats", () => {
  it("returns lists of supported input and output formats", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.conversion.getSupportedFormats();

    expect(result).toHaveProperty("inputFormats");
    expect(result).toHaveProperty("outputFormats");
    expect(Array.isArray(result.inputFormats)).toBe(true);
    expect(Array.isArray(result.outputFormats)).toBe(true);
    expect(result.inputFormats.length).toBeGreaterThan(0);
    expect(result.outputFormats.length).toBeGreaterThan(0);
    expect(result.inputFormats).toContain("markdown");
    expect(result.outputFormats).toContain("html");
  });
});

describe("conversion.convertText", () => {
  it("converts markdown to html successfully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const inputText = "# Hello World\n\nThis is a **test**.";

    const result = await caller.conversion.convertText({
      inputFormat: "markdown",
      outputFormat: "html",
      inputText,
      saveToHistory: false,
    });

    expect(result.success).toBe(true);
    expect(result.outputText).toBeDefined();
    expect(result.outputText).toContain("Hello World");
    expect(result.outputText).toContain("<h1");
    expect(result.conversionId).toBeDefined();
  });

  it("handles empty input gracefully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.conversion.convertText({
      inputFormat: "markdown",
      outputFormat: "html",
      inputText: "",
      saveToHistory: false,
    });

    expect(result.success).toBe(true);
    expect(result.outputText).toBeDefined();
  });
});
