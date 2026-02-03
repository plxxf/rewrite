import { describe, it, expect, beforeAll } from "vitest";
import { readFile } from "fs/promises";
import { convertDocument } from "./pandocService";
import { getFileExtension } from "./fileUtils";

describe("DOCX to Markdown Conversion", () => {
  it("should get correct file extension for docx format", () => {
    const ext = getFileExtension("docx");
    expect(ext).toBe("docx");
  });

  it("should get correct file extension for markdown format", () => {
    const ext = getFileExtension("markdown");
    expect(ext).toBe("md");
  });

  it("should convert Chinese DOCX to Markdown successfully", async () => {
    // Use the test DOCX file we created
    const result = await convertDocument({
      inputFormat: "docx",
      outputFormat: "markdown",
      inputFilePath: "/tmp/test-chinese-doc.docx",
    });

    expect(result.success).toBe(true);
    expect(result.outputFilePath).toBeDefined();
    expect(result.error).toBeUndefined();

    // Read and verify the output
    if (result.outputFilePath) {
      const outputContent = await readFile(result.outputFilePath, "utf-8");
      // Verify Chinese content is properly converted (title might not be in output)
      expect(outputContent).toContain("中文测试文本");
      expect(outputContent).toContain("你好世界");
      expect(outputContent).toContain("二级标题");
      expect(outputContent).toContain("第二段中文内容");
      // Ensure the conversion succeeded without garbled text
      expect(outputContent).not.toContain("�"); // No replacement characters
    }
  }, 30000); // 30 second timeout for conversion
});
