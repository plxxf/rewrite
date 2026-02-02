import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createConversion,
  updateConversion,
  getUserConversions,
  getConversionById,
  deleteConversion,
  createBatchJob,
  updateBatchJob,
  getBatchJobById,
  getUserBatchJobs,
  createBatchItem,
  updateBatchItem,
  getBatchItemsByJobId,
} from "./db";
import {
  convertDocument,
  cleanupFiles,
  getSupportedInputFormats,
  getSupportedOutputFormats,
} from "./pandocService";
import { storagePut } from "./storage";
import { readFile, writeFile as fsWriteFile } from "fs/promises";
import { nanoid } from "nanoid";
import archiver from "archiver";
import { createWriteStream } from "fs";
import path from "path";
import { runCleanup } from "./cleanupService";
import { getSchedulerStatus } from "./scheduler";
import { processConcurrently } from "./concurrencyControl";
import { logError, logInfo } from "./errorLogger";
import { recordConversionMetric, measureTime } from "./performanceMonitor";
import {
  FILE_SIZE_LIMITS,
  validateFileSize,
  validateBatchTotalSize,
  validateFileType,
} from "../shared/fileConfig";

export const appRouter = router({
  system: systemRouter,
  
  // Cleanup management (admin only)
  cleanup: router({
    // Manually trigger cleanup (admin only)
    runNow: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can trigger cleanup");
      }
      const result = await runCleanup();
      return result;
    }),
    
    // Get scheduler status
    getStatus: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can view cleanup status");
      }
      return getSchedulerStatus();
    }),
  }),
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  conversion: router({
    // Get supported formats
    getSupportedFormats: publicProcedure.query(() => {
      return {
        inputFormats: getSupportedInputFormats(),
        outputFormats: getSupportedOutputFormats(),
      };
    }),

    // Convert text
    convertText: protectedProcedure
      .input(
        z.object({
          inputFormat: z.string(),
          outputFormat: z.string(),
          inputText: z.string(),
          saveToHistory: z.boolean().default(true),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { inputFormat, outputFormat, inputText, saveToHistory } = input;

        // Validate text size
        const textSize = Buffer.byteLength(inputText, "utf-8");
        const sizeValidation = validateFileSize(textSize, FILE_SIZE_LIMITS.TEXT_CONVERSION_MAX);
        if (!sizeValidation.valid) {
          throw new Error(sizeValidation.error);
        }

        // Create conversion record
        const conversion = await createConversion({
          userId: ctx.user.id,
          inputFormat,
          outputFormat,
          inputText,
          status: "pending",
        });

        try {
          // Perform conversion
          const result = await convertDocument({
            inputFormat,
            outputFormat,
            inputText,
          });

          if (!result.success || !result.outputFilePath) {
            await updateConversion(conversion.id, {
              status: "failed",
              errorMessage: result.error || "Conversion failed",
            });
            throw new Error(result.error || "Conversion failed");
          }

          // Read output file
          const outputBuffer = await readFile(result.outputFilePath);
          const outputText = outputBuffer.toString("utf-8");

          // Upload output to S3 if saving to history
          let outputFileUrl: string | undefined;
          let outputFileKey: string | undefined;
          let outputFileName: string | undefined;

          if (saveToHistory) {
            const fileKey = `conversions/${ctx.user.id}/${nanoid()}-output.${outputFormat}`;
            const uploadResult = await storagePut(fileKey, outputBuffer, getMimeType(outputFormat));
            outputFileUrl = uploadResult.url;
            outputFileKey = fileKey;
            outputFileName = `output.${outputFormat}`;
          }

          // Update conversion record
          await updateConversion(conversion.id, {
            outputText,
            outputFileUrl,
            outputFileKey,
            outputFileName,
            status: "completed",
          });

          // Cleanup temporary files
          await cleanupFiles([result.outputFilePath]);

          return {
            success: true,
            outputText,
            outputFileUrl,
            conversionId: conversion.id,
          };
        } catch (error) {
          await updateConversion(conversion.id, {
            status: "failed",
            errorMessage: error instanceof Error ? error.message : "Unknown error",
          });
          throw error;
        }
      }),

    // Upload and convert fi    // Convert file
    convertFile: protectedProcedure
      .input(
        z.object({
          inputFormat: z.string(),
          outputFormat: z.string(),
          fileName: z.string(),
          fileData: z.string(), // base64
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { inputFormat, outputFormat, fileName, fileData } = input;

        // Decode base64 to get file size
        const fileBuffer = Buffer.from(fileData, "base64");
        const fileSize = fileBuffer.length;

        // Validate file size
        const sizeValidation = validateFileSize(fileSize);
        if (!sizeValidation.valid) {
          throw new Error(sizeValidation.error);
        }

        // Validate file type
        const typeValidation = validateFileType(fileName, inputFormat);
        if (!typeValidation.valid) {
          throw new Error(typeValidation.error);
        };

        // Create conversion record
        const conversion = await createConversion({
          userId: ctx.user.id,
          inputFormat,
          outputFormat,
          inputFileName: fileName,
          status: "pending",
        });

        try {
          // Decode base64 file data
          const fileBuffer = Buffer.from(fileData, "base64");

          // Upload input file to S3
          const inputFileKey = `conversions/${ctx.user.id}/${nanoid()}-${fileName}`;
          const inputUploadResult = await storagePut(inputFileKey, fileBuffer, getMimeType(inputFormat));

          // Write file to temp location for pandoc
          const tempInputPath = `/tmp/pandoc-conversions/input-${nanoid()}.${fileName.split(".").pop()}`;
          await require("fs/promises").writeFile(tempInputPath, fileBuffer);

          // Perform conversion
          const result = await convertDocument({
            inputFormat,
            outputFormat,
            inputFilePath: tempInputPath,
          });

          if (!result.success || !result.outputFilePath) {
            await updateConversion(conversion.id, {
              status: "failed",
              errorMessage: result.error || "Conversion failed",
            });
            throw new Error(result.error || "Conversion failed");
          }

          // Read output file
          const outputBuffer = await readFile(result.outputFilePath);

          // Upload output to S3
          const outputFileKey = `conversions/${ctx.user.id}/${nanoid()}-output.${outputFormat}`;
          const outputUploadResult = await storagePut(outputFileKey, outputBuffer, getMimeType(outputFormat));

          // Update conversion record
          await updateConversion(conversion.id, {
            inputFileUrl: inputUploadResult.url,
            inputFileKey,
            outputFileUrl: outputUploadResult.url,
            outputFileKey,
            outputFileName: `output.${outputFormat}`,
            status: "completed",
          });

          // Cleanup temporary files
          await cleanupFiles([tempInputPath, result.outputFilePath]);

          return {
            success: true,
            outputFileUrl: outputUploadResult.url,
            conversionId: conversion.id,
          };
        } catch (error) {
          await updateConversion(conversion.id, {
            status: "failed",
            errorMessage: error instanceof Error ? error.message : "Unknown error",
          });
          throw error;
        }
      }),

    // Get user's conversion history
    getHistory: protectedProcedure.query(async ({ ctx }) => {
      return getUserConversions(ctx.user.id);
    }),

    // Get single conversion by ID
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        // Use userId parameter for permission check
        const conversion = await getConversionById(input.id, ctx.user.id);
        if (!conversion) {
          throw new Error("Conversion not found or access denied");
        }
        return conversion;
      }),

    // Delete conversion
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Use userId parameter for permission check
        const conversion = await getConversionById(input.id, ctx.user.id);
        if (!conversion) {
          throw new Error("Conversion not found or access denied");
        }
        await deleteConversion(input.id);
        return { success: true };
      }),
  }),

  batch: router({
    // Create batch conversion job
    createJob: protectedProcedure
      .input(
        z.object({
          name: z.string().optional(),
          inputFormat: z.string(),
          outputFormat: z.string(),
          files: z.array(
            z.object({
              fileName: z.string(),
              fileData: z.string(), // base64
            })
          ),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { name, inputFormat, outputFormat, files } = input;

        // Validate total batch size
        let totalSize = 0;
        for (const file of files) {
          const fileBuffer = Buffer.from(file.fileData, "base64");
          const fileSize = fileBuffer.length;

          // Validate individual file size
          const sizeValidation = validateFileSize(fileSize);
          if (!sizeValidation.valid) {
            throw new Error(`${file.fileName}: ${sizeValidation.error}`);
          }

          // Validate file type
          const typeValidation = validateFileType(file.fileName, inputFormat);
          if (!typeValidation.valid) {
            throw new Error(`${file.fileName}: ${typeValidation.error}`);
          }

          totalSize += fileSize;
        }

        // Validate total size
        const totalValidation = validateBatchTotalSize(totalSize);
        if (!totalValidation.valid) {
          throw new Error(totalValidation.error);
        }

        // Create batch job
        const batchJob = await createBatchJob({
          userId: ctx.user.id,
          name: name || `批量转换 ${new Date().toLocaleString("zh-CN")}`,
          inputFormat,
          outputFormat,
          totalFiles: files.length,
          status: "processing",
        });

        // Create batch items
        const items = await Promise.all(
          files.map((file) =>
            createBatchItem({
              batchJobId: batchJob.id,
              fileName: file.fileName,
              status: "pending",
            })
          )
        );

        // Process files asynchronously
        processFilesInBackground(batchJob.id, files, inputFormat, outputFormat, ctx.user.id).catch(
          (error) => {
            console.error("[Batch] Background processing error:", error);
          }
        );

        return {
          jobId: batchJob.id,
          totalFiles: files.length,
        };
      }),

    // Get batch job status
    getJobStatus: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Use userId parameter for permission check
        const job = await getBatchJobById(input.jobId, ctx.user.id);
        if (!job) {
          throw new Error("Batch job not found or access denied");
        }

        const items = await getBatchItemsByJobId(input.jobId);

        return {
          job,
          items,
        };
      }),

    // Get user's batch jobs
    getUserJobs: protectedProcedure.query(async ({ ctx }) => {
      return getUserBatchJobs(ctx.user.id);
    }),
  }),
});

// Background processing function
async function processFilesInBackground(
  jobId: number,
  files: Array<{ fileName: string; fileData: string }>,
  inputFormat: string,
  outputFormat: string,
  userId: number
) {
  const items = await getBatchItemsByJobId(jobId);
  const outputFiles: string[] = [];

  let completedCount = 0;
  let failedCount = 0;

  logInfo(`Starting batch conversion for job ${jobId}`, {
    userId,
    operation: "batch-conversion",
    metadata: { jobId, fileCount: files.length, inputFormat, outputFormat },
  });

  // Process files with concurrency control (max 3 concurrent)
  await processConcurrently(
    files,
    async (file, i) => {
      const item = items[i];
      if (!item) return;

      const startTime = Date.now();
      let inputSize = 0;
      let outputSize = 0;

      try {
        await updateBatchItem(item.id, { status: "processing" });

        // Decode base64 file data
        const fileBuffer = Buffer.from(file.fileData, "base64");
        inputSize = fileBuffer.length;

        // Upload input file to S3
        const inputFileKey = `batch/${userId}/${jobId}/${nanoid()}-${file.fileName}`;
        await storagePut(inputFileKey, fileBuffer, getMimeType(inputFormat));

        // Write file to temp location for pandoc
        const tempInputPath = `/tmp/pandoc-conversions/batch-${jobId}-${i}-input.${file.fileName.split(".").pop()}`;
        await fsWriteFile(tempInputPath, fileBuffer);

        // Perform conversion
        const result = await convertDocument({
          inputFormat,
          outputFormat,
          inputFilePath: tempInputPath,
        });

        if (!result.success || !result.outputFilePath) {
          throw new Error(result.error || "Conversion failed");
        }

        // Read output file
        const outputBuffer = await readFile(result.outputFilePath);
        outputSize = outputBuffer.length;

        // Upload output to S3
        const outputFileKey = `batch/${userId}/${jobId}/${nanoid()}-output-${i}.${outputFormat}`;
        const outputUploadResult = await storagePut(outputFileKey, outputBuffer, getMimeType(outputFormat));

        // Create conversion record
        const conversion = await createConversion({
          userId,
          inputFormat,
          outputFormat,
          inputFileName: file.fileName,
          outputFileName: `output-${i}.${outputFormat}`,
          inputFileKey,
          outputFileKey,
          inputFileUrl: `https://storage.example.com/${inputFileKey}`,
          outputFileUrl: outputUploadResult.url,
          status: "completed",
        });

        // Update batch item
        await updateBatchItem(item.id, {
          status: "completed",
          conversionId: conversion.id,
        });

        outputFiles.push(result.outputFilePath);
        completedCount++;

        // Record performance metric
        const conversionTime = Date.now() - startTime;
        recordConversionMetric({
          userId,
          inputFormat,
          outputFormat,
          inputSize,
          outputSize,
          conversionTime,
          success: true,
          timestamp: new Date(),
        });

        // Cleanup temp files
        await cleanupFiles([tempInputPath]);
      } catch (error) {
        const conversionTime = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        
        logError(
          `Batch file conversion failed: ${file.fileName}`,
          error instanceof Error ? error : new Error(errorMessage),
          { userId, operation: "batch-file-conversion", metadata: { jobId, fileName: file.fileName } }
        );

        await updateBatchItem(item.id, {
          status: "failed",
          errorMessage,
        });
        
        failedCount++;

        // Record failed conversion metric
        recordConversionMetric({
          userId,
          inputFormat,
          outputFormat,
          inputSize,
          outputSize: 0,
          conversionTime,
          success: false,
          errorMessage,
          timestamp: new Date(),
        });
      }
    },
    3 // Max 3 concurrent conversions
  );

  // Create ZIP file with all outputs
  try {
    const zipPath = `/tmp/pandoc-conversions/batch-${jobId}-output.zip`;
    await createZipFile(outputFiles, zipPath);

    // Upload ZIP to S3
    const zipBuffer = await readFile(zipPath);
    const zipFileKey = `batch/${userId}/${jobId}/output.zip`;
    const zipUploadResult = await storagePut(zipFileKey, zipBuffer, "application/zip");

    // Update batch job
    await updateBatchJob(jobId, {
      completedFiles: completedCount,
      failedFiles: failedCount,
      status: failedCount === files.length ? "failed" : "completed",
      zipFileUrl: zipUploadResult.url,
      zipFileKey,
    });

    // Cleanup
    await cleanupFiles([zipPath, ...outputFiles]);
  } catch (error) {
    console.error("[Batch] Failed to create ZIP:", error);
    await updateBatchJob(jobId, {
      completedFiles: completedCount,
      failedFiles: failedCount,
      status: "failed",
    });
  }
}

// Helper function to create ZIP file
function createZipFile(filePaths: string[], outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(outputPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => resolve());
    archive.on("error", (err) => reject(err));

    archive.pipe(output);

    filePaths.forEach((filePath, index) => {
      const fileName = path.basename(filePath);
      archive.file(filePath, { name: `file-${index + 1}-${fileName}` });
    });

    archive.finalize();
  });
}

export type AppRouter = typeof appRouter;

// Helper function to get MIME type based on format
function getMimeType(format: string): string {
  const mimeTypes: Record<string, string> = {
    markdown: "text/markdown",
    html: "text/html",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    pdf: "application/pdf",
    latex: "application/x-latex",
    rst: "text/x-rst",
    textile: "text/x-textile",
    asciidoc: "text/asciidoc",
    org: "text/org",
    mediawiki: "text/x-wiki",
    epub: "application/epub+zip",
    odt: "application/vnd.oasis.opendocument.text",
    rtf: "application/rtf",
    plain: "text/plain",
    json: "application/json",
    ipynb: "application/x-ipynb+json",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  };

  return mimeTypes[format] || "application/octet-stream";
}
