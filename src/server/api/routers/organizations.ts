import { createTRPCRouter, publicProcedure } from "../trpc";
import { faker } from "@faker-js/faker/locale/pl";
import { z } from "zod";
import slugify from "slugify";

const tags = [
  "Druk3D",
  "Piwo",
  "Fotografia",
  "Programowanie",
  "Muzyka",
  "Taniec",
  "Kultura",
  "Sport",
];

const departments = [
  "W1",
  "W2",
  "W3",
  "W4",
  "W5",
  "W6",
  "W7",
  "W8",
  "W9",
  "W10",
  "W11",
  "W12",
];

const generateFakeManagement = () => {
  return Array.from({ length: 3 }).map(() => faker.name.fullName());
};

const generateFakeSocialLinks = () => {
  return {
    facebook: faker.internet.url(),
    instagram: faker.internet.url(),
    website: faker.internet.url(),
  };
};

const generateFakeOrganization = () => {
  return {
    id: faker.datatype.uuid(),
    name: faker.company.name(),
    description: faker.commerce.productDescription(),
    longDescription: faker.lorem.paragraphs(9),
    management: generateFakeManagement(),
    createdAt: faker.date.past(),
    numberOfProjects: faker.datatype.number(10),
    members: faker.datatype.number(100),
    socials: generateFakeSocialLinks(),
    logoUrl: faker.image.cats(150, 150, true),
    tags: faker.helpers.arrayElements(tags, 3),
    department: faker.helpers.arrayElement(departments),
  };
};

const globalMock = globalThis as unknown as {
  mockData: ReturnType<typeof generateFakeOrganization>[];
};

const getData = () => {
  if (!globalMock.mockData) {
    const mockData = Array.from({ length: 30 }).map(generateFakeOrganization);
    globalMock.mockData = mockData;
  }

  return globalMock.mockData;
};

export const organizations = createTRPCRouter({
  getAll: publicProcedure.query(() => {
    return getData();
  }),
  get: publicProcedure
    .input(
      z.object({
        slug: z.string().min(1).max(100),
      })
    )
    .query(({ input }) => {
      return (
        getData().find((org) => {
          return slugify(org.name) === input.slug;
        }) ?? getData()[0]
      );
    }),
});
