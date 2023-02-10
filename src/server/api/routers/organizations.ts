
import { createTRPCRouter, publicProcedure } from "../trpc";
import { faker } from "@faker-js/faker/locale/pl";

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
]

const generateFakeOrganization = () => {
  return {
    id: faker.datatype.uuid(),
    name: faker.company.name(),
    description: faker.lorem.sentences(2),
    logoUrl: faker.image.cats(150, 150, true),
    tags: faker.helpers.arrayElements(tags, 3),
    department: faker.helpers.arrayElement(departments),
  }
}

const mockData = Array.from({ length: 30 }).map(generateFakeOrganization);

export const organizations = createTRPCRouter({
  getAll: publicProcedure.query(() => {
    return mockData;
  }),
});
