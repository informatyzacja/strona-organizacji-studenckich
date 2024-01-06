import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { ApiCollections } from "@/utils/api-collection";
import { createDirectus, rest } from "@directus/sdk";
import { Chain } from "@/utils/zeus";
import { env } from "@/env.mjs";

type NoUndefinedField<T> = {
  [P in keyof T]-?: NoUndefinedField<Exclude<T[P], undefined>>;
};
export const createTRPCContext = () => {
  const directusSdk = createDirectus<NoUndefinedField<ApiCollections>>(
    env.NEXT_PUBLIC_DIRECTUS_URL,
  ).with(rest());

  const query = Chain(`${env.NEXT_PUBLIC_DIRECTUS_URL}/graphql`)("query");

  return { directusSdk, query };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;
