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
} from "./db";
import {
  convertDocument,
  cleanupFiles,
  getSupportedInputFormats,
  getSupportedOutputFormats,
} from "./pandocService";
import { storagePut } from "./storage";
import { readFile } from "fs/promises";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,
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

    // Upload and convert file
    convertFile: protectedProcedure
      .input(
        z.object({
          inputFormat: z.string(),
          outputFormat: z.string(),
          fileData: z.string(), // base64 encoded file data
          fileName: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { inputFormat, outputFormat, fileData, fileName } = input;

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
        const conversion = await getConversionById(input.id);
        if (!conversion || conversion.userId !== ctx.user.id) {
          throw new Error("Conversion not found");
        }
        return conversion;
      }),

    // Delete conversion
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const conversion = await getConversionById(input.id);
        if (!conversion || conversion.userId !== ctx.user.id) {
          throw new Error("Conversion not found");
        }
        await deleteConversion(input.id);
        return { success: true };
      }),
  }),
});

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
