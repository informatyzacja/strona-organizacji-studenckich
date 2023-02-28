import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const tags = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return (await ctx.prisma.tag.findMany()).map((tag) => tag.text);
  }),
  listAdmin: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.tag.findMany({
      select: {
        id: true,
        text: true,
        _count: {
          select: {
            organizations: true,
          },
        },
      },
    });
  }),
  get: protectedProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.tag.findUnique({
        where: { text: input.text },
        include: {
          organizations: {
            include: {
              Tags: true,
            },
          },
        },
      });
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.tag.delete({ where: { id: input.id } });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        text: z.string().min(1).max(30),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.tag.update({ where: { id: input.id }, data: input });
    }),
  create: protectedProcedure
    .input(
      z.object({
        text: z.string().min(1).max(30),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.tag.create({ data: { text: input.text } });
    }),
});
