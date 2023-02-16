import { faker } from "@faker-js/faker/locale/pl";
import type { Prisma } from "@prisma/client";

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

export const tagFactory = (
  props?: Partial<Prisma.TagCreateInput>
): Prisma.TagCreateInput => {
  return {
    text: faker.helpers.arrayElement(tags),
    ...props,
  };
};
