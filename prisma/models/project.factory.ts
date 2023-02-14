import { faker } from "@faker-js/faker/locale/pl";
import type { Prisma } from "@prisma/client";

export const projectFactory = (
  props?: Partial<Prisma.ProjectsCreateInput>
): Omit<Prisma.ProjectsCreateInput, "organization"> => {
  return {
    name: faker.company.name(),
    description: faker.commerce.productDescription(),
    ...props,
  };
};
