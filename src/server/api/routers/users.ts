import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const users = createTRPCRouter({
  doesExist: publicProcedure
    .input(
      z.object({
        email: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findFirst({
        where: {
          email: input.email,
        },
      });

      return Boolean(user);
    }),
});
