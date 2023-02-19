import { z } from "zod";

export const maxFileSize = 3 * 1024 * 1024;

export const acceptedImageTypes = ["image/png", "image/jpeg", "image/webp"];

export const uploadResponseSchema = z.object({
  url: z.string(),
});
