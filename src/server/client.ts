import { createServerSideHelpers } from "@trpc/react-query/server";

import superjson from "superjson";
import { appRouter } from "./api/root";
import { createTRPCContext } from "./api/trpc";

export const trpcClient = createServerSideHelpers({
  router: appRouter,
  ctx: createTRPCContext(),
  transformer: superjson,
});
