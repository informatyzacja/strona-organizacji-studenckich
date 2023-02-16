import { faker } from "@faker-js/faker/locale/pl";
import type { Prisma } from "@prisma/client";

export const userFactory = (
  props?: Partial<Prisma.UserCreateInput>
): Prisma.UserCreateInput => {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();

  return {
    name: firstName + " " + lastName,
    email: faker.internet.email(firstName, lastName),
    role: "USER",
    ...props,
  };
};
