import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const organizations = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return (
      await ctx.query({
        Organizacje: [
          { sort: ["name"] },
          {
            id: true,
            slug: true,
            name: true,
            shortDescription: true,
            logo: true,
            tags: [
              {
                filter: {
                  Tagi_id: {
                    tag: {
                      _nnull: true,
                    },
                  },
                },
              },
              {
                Tagi_id: [
                  {},
                  {
                    tag: true,
                  },
                ],
              },
            ],
          },
        ],
      })
    ).Organizacje.map((org) => ({
      ...org,
      tags:
        org.tags
          ?.map((tag) => tag.Tagi_id?.tag)
          .filter((x): x is string => Boolean(x)) ?? [],
    }));
  }),
  get: publicProcedure
    .input(
      z.object({
        slug: z.string().min(1).max(100),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { Organizacje } = await ctx.query({
        Organizacje: [
          { filter: { slug: { _eq: input.slug } } },
          {
            id: true,
            slug: true,
            name: true,
            field: true,
            achievements: true,
            areasOfInterest: true,
            email: true,
            facebook: true,
            distinguishingFeatures: true,
            images: [
              {},
              {
                directus_files_id: true,
              },
            ],
            instagram: true,
            linkedin: true,
            logo: true,
            longDescription: true,
            shortDescription: true,
            skillsAndChallenges: true,
            website: true,
            youtube: true,
            tags: [
              {},
              {
                Tagi_id: [
                  {},
                  {
                    tag: true,
                  },
                ],
              },
            ],
          },
        ],
      });

      const organization = Organizacje.at(0);

      if (!organization) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found",
        });
      }

      return {
        ...organization,
        images:
          organization.images?.map((image) => image.directus_files_id) ?? [],
        tags:
          organization.tags
            ?.map((tag) => tag.Tagi_id?.tag)
            .filter((x): x is string => Boolean(x)) ?? [],
      };
    }),
});
