import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/server/db";

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
      orderBy: {
        logoUrl: "asc",
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

      return organization;
    }),

  createByEmail: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.user.create({
        data: {
          email: input.email,
          role: "OWNER",
        },
      });
    }),
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        email: z.string().email(),
        slug: z.string().min(1).max(100),
        type: z.string().min(1).max(100),
        description: z.string().min(1).max(220),
        longDescription: z.string().max(6000).optional(),
        logoUrl: z.string().max(100).optional(),
        department: z.string().min(1).max(100).optional(),
        tags: z.array(z.string().min(1).max(100)).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.organization.create({
        data: {
          name: input.name,
          slug: input.slug,
          type: input.type,
          description: input.description,
          longDescription: input.longDescription,
          logoUrl: input.logoUrl,
          department: input.department,
          owner: {
            connectOrCreate: {
              where: {
                email: input.email,
              },
              create: {
                name: input.name,
                email: input.email,
                role: "OWNER",
              },
            },
          },
          Tags: {
            connectOrCreate: input.tags?.map((tag) => ({
              where: {
                text: tag,
              },
              create: {
                text: tag,
              },
            })),
          },
        },
      });
    }),
});
