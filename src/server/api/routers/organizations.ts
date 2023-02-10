
import { createTRPCRouter, publicProcedure } from "../trpc";
import { faker } from "@faker-js/faker/locale/pl";

const generateFakeOrganization = () => {
  return {
    id: faker.datatype.uuid(),
    name: faker.company.name(),
    description: faker.lorem.sentences(2),
    logoUrl: faker.image.cats(150, 150, true),
    tags: [faker.company.bsNoun(), faker.company.bsNoun(), faker.company.bsNoun()]
  }
}


const mockData = Array.from({ length: 30 }).map(generateFakeOrganization);

export const organizations = createTRPCRouter({
  getAll: publicProcedure.query(() => {
    return mockData;
  }),
});
