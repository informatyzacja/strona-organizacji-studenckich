import { z } from "zod";

export const maxFileSize = 3 * 1024 * 1024;

export const uploadResponseSchema = z.object({
  url: z.string(),
});
