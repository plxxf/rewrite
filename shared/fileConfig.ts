/**
 * File upload and conversion configuration
 */

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  SINGLE_FILE_MAX: 10 * 1024 * 1024, // 10MB per file
  BATCH_TOTAL_MAX: 50 * 1024 * 1024, // 50MB total for batch
  TEXT_CONVERSION_MAX: 5 * 1024 * 1024, // 5MB for text conversion
} as const;

// Supported MIME types for each format
export const SUPPORTED_MIME_TYPES: Record<string, string[]> = {
  markdown: ["text/markdown", "text/plain", "text/x-markdown"],
  html: ["text/html", "application/xhtml+xml"],
  docx: [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  pdf: ["application/pdf"],
  latex: ["text/x-tex", "application/x-tex", "text/plain"],
  rst: ["text/x-rst", "text/plain"],
  textile: ["text/x-textile", "text/plain"],
  mediawiki: ["text/plain"],
  org: ["text/plain"],
  txt: ["text/plain"],
  rtf: ["application/rtf", "text/rtf"],
  odt: ["application/vnd.oasis.opendocument.text"],
  epub: ["application/epub+zip"],
} as const;

// File extension to format mapping
export const FILE_EXTENSIONS: Record<string, string> = {
  md: "markdown",
  markdown: "markdown",
  html: "html",
  htm: "html",
  docx: "docx",
  pdf: "pdf",
  tex: "latex",
  latex: "latex",
  rst: "rst",
  textile: "textile",
  wiki: "mediawiki",
  org: "org",
  txt: "txt",
  rtf: "rtf",
  odt: "odt",
  epub: "epub",
} as const;

// File retention period (in days)
export const FILE_RETENTION_DAYS = 7;

// Rate limiting configuration
export const RATE_LIMITS = {
  CONVERSIONS_PER_HOUR: 50, // Max conversions per hour per user
  BATCH_JOBS_PER_DAY: 10, // Max batch jobs per day per user
} as const;

/**
 * Validate file size
 */
export function validateFileSize(
  fileSize: number,
  maxSize: number = FILE_SIZE_LIMITS.SINGLE_FILE_MAX
): { valid: boolean; error?: string } {
  if (fileSize === 0) {
    return { valid: false, error: "文件为空" };
  }

  if (fileSize > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `文件大小 ${fileSizeMB}MB 超过限制 ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Validate batch total size
 */
export function validateBatchTotalSize(
  totalSize: number
): { valid: boolean; error?: string } {
  if (totalSize > FILE_SIZE_LIMITS.BATCH_TOTAL_MAX) {
    const maxSizeMB = (FILE_SIZE_LIMITS.BATCH_TOTAL_MAX / (1024 * 1024)).toFixed(1);
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `批量文件总大小 ${totalSizeMB}MB 超过限制 ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

/**
 * Validate file type based on extension and format
 */
export function validateFileType(
  filename: string,
  expectedFormat: string
): { valid: boolean; error?: string } {
  const extension = getFileExtension(filename);

  if (!extension) {
    return { valid: false, error: "无法识别文件类型" };
  }

  const detectedFormat = FILE_EXTENSIONS[extension];

  if (!detectedFormat) {
    return {
      valid: false,
      error: `不支持的文件类型: .${extension}`,
    };
  }

  // For flexible formats like txt, markdown, allow them for text-based conversions
  const flexibleFormats = ["txt", "markdown", "rst", "textile", "mediawiki", "org"];
  
  if (
    detectedFormat !== expectedFormat &&
    !(flexibleFormats.includes(detectedFormat) && flexibleFormats.includes(expectedFormat))
  ) {
    return {
      valid: false,
      error: `文件类型 .${extension} 与选择的格式 ${expectedFormat.toUpperCase()} 不匹配`,
    };
  }

  return { valid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}
