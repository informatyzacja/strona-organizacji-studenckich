import { createTRPCRouter, publicProcedure } from "../trpc";

export const tags = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return (await ctx.prisma.tag.findMany()).map((tag) => tag.text);
  }),
});
