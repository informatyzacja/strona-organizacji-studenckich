import { faker } from "@faker-js/faker/locale/pl";
import type { Prisma } from "@prisma/client";
import slugify from "slugify";
import { contactMethodFactory } from "./contactMethod.factory";
import { managerFactory } from "./manager.factory";
import { projectFactory } from "./project.factory";
import { tagFactory } from "./tag.factory";
import { userFactory } from "./user.factory";

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

export const organizationFactory = (
  props?: Partial<Prisma.OrganizationCreateInput>
): Prisma.OrganizationCreateInput => {
  const name = faker.company.name();

  const tags = Array.from({
    length: faker.datatype.number({ min: 1, max: 6 }),
  }).map(() => tagFactory());

  return {
    name,
    description: faker.commerce.productDescription(),
    longDescription: faker.lorem.paragraphs(9),
    createdAt: faker.date.past(),
    slug: slugify(name) + faker.random.numeric(4),
    numberOfUsers: faker.datatype.number(100),
    foundationDate: faker.date.past(),
    residence: faker.helpers.arrayElement(departments),
    owner: {
      create: userFactory({ role: "OWNER" }),
    },
    Tags: {
      connectOrCreate: tags.map((tag) => ({
        where: {
          text: tag.text,
        },
        create: tag,
      })),
    },
    ContactMethods: {
      create: Array.from({ length: 3 }).map(() => contactMethodFactory()),
    },
    Managers: {
      createMany: {
        data: Array.from({ length: 3 }).map(() => managerFactory()),
      },
    },
    Projects: {
      createMany: {
        data: Array.from({
          length: faker.datatype.number({ min: 0, max: 4 }),
        }).map(() => projectFactory()),
      },
    },
    ...props,
  };
};
