import { env } from "@/env.mjs";
import type { components } from "./api-collection";

export const directusFileUrl = <
  T extends string | undefined | null | components["schemas"]["Files"],
  R = T extends undefined | null ? undefined : string,
>(
  fileId: T,
): R => {
  if (!fileId) {
    return undefined as R;
  }

  if (typeof fileId === "string") {
    return `${env.DIRECTUS_URL}/assets/${fileId}` as R;
  }

  return `${env.DIRECTUS_URL}/assets/${fileId.id}` as R;
};
