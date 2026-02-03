import { describe, it, expect } from "vitest";
import { convertDocument } from "./pandocService";
import { readFile } from "fs/promises";

describe("Markdown to DOCX Conversion", () => {
  it("should convert Chinese Markdown to DOCX successfully", async () => {
    const markdownContent = `# 测试中文标题

这是一段**中文**测试文本，用于验证 Markdown 转 DOCX 功能。

## 二级标题

这里有一些格式化的文本：

- **粗体文本**
- *斜体文本*
- \`代码文本\`

### 列表测试

1. 第一项
2. 第二项
3. 第三项

无序列表：

- 项目 A
- 项目 B
- 项目 C

### 引用测试

> 这是一段引用文本。

### 代码块测试

\`\`\`python
def hello():
    print("你好，世界！")
\`\`\`

**结论**：这是一个完整的 Markdown 文档测试。
`;

    // 执行转换
    const result = await convertDocument({
      inputFormat: "markdown",
      outputFormat: "docx",
      inputText: markdownContent,
    });

    // 验证转换成功
    expect(result.success).toBe(true);
    expect(result.outputFilePath).toBeDefined();
    expect(result.error).toBeUndefined();

    // 验证输出文件存在且不为空
    if (result.outputFilePath) {
      const stats = await require("fs/promises").stat(result.outputFilePath);
      expect(stats.size).toBeGreaterThan(0);
      expect(stats.size).toBeGreaterThan(5000); // DOCX 文件应该至少有几KB
      
      console.log(`✅ DOCX 文件大小: ${stats.size} bytes`);
    }
  }, 30000); // 30 second timeout

  it("should handle empty markdown content", async () => {
    const result = await convertDocument({
      inputFormat: "markdown",
      outputFormat: "docx",
      inputText: "",
    });

    expect(result.success).toBe(true);
    expect(result.outputFilePath).toBeDefined();
  }, 30000);

  it("should handle markdown with special characters", async () => {
    const markdownContent = `# 特殊字符测试

这里包含一些特殊字符：

- 中文标点：，。！？；：""''（）【】
- 数学符号：± × ÷ ≈ ≠ ≤ ≥
- 其他符号：© ® ™ € £ ¥

表格测试：

| 列1 | 列2 | 列3 |
|-----|-----|-----|
| A   | B   | C   |
| 1   | 2   | 3   |
`;

    const result = await convertDocument({
      inputFormat: "markdown",
      outputFormat: "docx",
      inputText: markdownContent,
    });

    expect(result.success).toBe(true);
    expect(result.outputFilePath).toBeDefined();
    expect(result.error).toBeUndefined();
  }, 30000);
});
