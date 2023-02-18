import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const organizations = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    const organizations = await ctx.prisma.organization.findMany({
      select: {
        Tags: true,
        name: true,
        slug: true,
        type: true,
        description: true,
        logoUrl: true,
        department: true,
      },
    });

    return organizations.map((organization) => ({
      ...organization,
      Tags: organization.Tags.map((tag) => tag.text),
    }));
  }),
  get: publicProcedure
    .input(
      z.object({
        slug: z.string().min(1).max(100),
      })
    )
    .query(async ({ input, ctx }) => {
      const organization = await ctx.prisma.organization.findUnique({
        where: {
          slug: input.slug,
        },
        include: {
          ContactMethods: true,
          Tags: true,
          owner: true,
        },
      });

      if (!organization) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found",
        });
      }

      return {
        ...organization,
        Tags: organization.Tags.map((tag) => tag.text),
      };
    }),
});
