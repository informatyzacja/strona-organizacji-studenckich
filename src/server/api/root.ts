import { createTRPCRouter } from "./trpc";
import { organizations } from "./routers/organizations";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  organizations,
});

// export type definition of API
export type AppRouter = typeof appRouter;
