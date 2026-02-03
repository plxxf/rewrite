import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { nanoid } from "nanoid";

const execAsync = promisify(exec);

export interface ConversionOptions {
  inputFormat: string;
  outputFormat: string;
  inputText?: string;
  inputFilePath?: string;
}

export interface ConversionResult {
  outputText?: string;
  outputFilePath?: string;
  success: boolean;
  error?: string;
}

// Temporary directory for file conversions
const TEMP_DIR = "/tmp/pandoc-conversions";

// Ensure temp directory exists
async function ensureTempDir() {
  if (!existsSync(TEMP_DIR)) {
    await mkdir(TEMP_DIR, { recursive: true });
  }
}

/**
 * Convert document using Pandoc
 */
export async function convertDocument(options: ConversionOptions): Promise<ConversionResult> {
  await ensureTempDir();

  const { inputFormat, outputFormat, inputText, inputFilePath } = options;
  
  // Generate unique filenames
  const sessionId = nanoid(10);
  const inputFile = inputFilePath || path.join(TEMP_DIR, `input-${sessionId}.${getFileExtension(inputFormat)}`);
  const outputFile = path.join(TEMP_DIR, `output-${sessionId}.${getFileExtension(outputFormat)}`);

    try {
      // Write input text to file if provided
      if (!inputFilePath) {
        await writeFile(inputFile, inputText || "", "utf-8");
      }

    // Build pandoc command with UTF-8 encoding support
    // Add --from and --to with explicit encoding, and set proper metadata for DOCX
    const command = `pandoc -f ${inputFormat} -t ${outputFormat} --metadata lang=zh-CN "${inputFile}" -o "${outputFile}"`;

    // Execute pandoc
    const { stderr } = await execAsync(command, {
      timeout: 30000, // 30 second timeout
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });

    if (stderr) {
      console.warn("[Pandoc] Warning:", stderr);
    }

    // Check if output file was created
    if (!existsSync(outputFile)) {
      throw new Error("Pandoc did not generate output file");
    }

    return {
      outputFilePath: outputFile,
      success: true,
    };
  } catch (error) {
    console.error("[Pandoc] Conversion error:", error);
    
    // Cleanup on error
    try {
      if (!inputFilePath && existsSync(inputFile)) {
        await unlink(inputFile);
      }
      if (existsSync(outputFile)) {
        await unlink(outputFile);
      }
    } catch (cleanupError) {
      console.error("[Pandoc] Cleanup error:", cleanupError);
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown conversion error",
    };
  }
}

/**
 * Cleanup temporary files after conversion
 */
export async function cleanupFiles(filePaths: string[]): Promise<void> {
  for (const filePath of filePaths) {
    try {
      if (existsSync(filePath)) {
        await unlink(filePath);
      }
    } catch (error) {
      console.error(`[Pandoc] Failed to cleanup file ${filePath}:`, error);
    }
  }
}

/**
 * Get file extension for a given format
 */
function getFileExtension(format: string): string {
  const extensionMap: Record<string, string> = {
    markdown: "md",
    html: "html",
    docx: "docx",
    pdf: "pdf",
    latex: "tex",
    rst: "rst",
    textile: "textile",
    asciidoc: "adoc",
    org: "org",
    mediawiki: "wiki",
    epub: "epub",
    odt: "odt",
    rtf: "rtf",
    plain: "txt",
    json: "json",
    ipynb: "ipynb",
    pptx: "pptx",
  };

  return extensionMap[format] || "txt";
}

/**
 * Get list of supported input formats
 */
export function getSupportedInputFormats(): string[] {
  return [
    "markdown",
    "html",
    "docx",
    "latex",
    "rst",
    "textile",
    "asciidoc",
    "org",
    "mediawiki",
    "epub",
    "odt",
    "json",
    "ipynb",
  ];
}

/**
 * Get list of supported output formats
 */
export function getSupportedOutputFormats(): string[] {
  return [
    "markdown",
    "html",
    "docx",
    "pdf",
    "latex",
    "rst",
    "textile",
    "asciidoc",
    "org",
    "mediawiki",
    "epub",
    "odt",
    "rtf",
    "plain",
    "json",
    "ipynb",
    "pptx",
  ];
}
