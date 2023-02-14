import { faker } from "@faker-js/faker/locale/pl";
import type { Prisma } from "@prisma/client";

const contactTypes = ["Facebook", "Instagram", "Website", "Email"];

export const contactMethodFactory = (
  props?: Partial<Prisma.ContactMethodsCreateInput>
): Omit<Prisma.ContactMethodsCreateInput, "organization"> => {
  return {
    contactLink: faker.internet.url(),
    contactType: faker.helpers.arrayElement(contactTypes),
    ...props,
  };
};
