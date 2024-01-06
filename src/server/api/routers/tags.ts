import { createTRPCRouter, publicProcedure } from "../trpc";

export const tags = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx
      .query({
        Tagi: [
          {},
          {
            id: true,
            tag: true,
          },
        ],
      })
      .then((tags) => tags.Tagi.map((tag) => tag.tag));
  }),
});
