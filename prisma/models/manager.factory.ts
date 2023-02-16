import { faker } from "@faker-js/faker/locale/pl";
import type { Prisma } from "@prisma/client";

export const managerFactory = (
  props?: Partial<Prisma.ManagersCreateInput>
): Omit<Prisma.ManagersCreateInput, "organization"> => {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();

  return {
    name: firstName + " " + lastName,
    email: faker.internet.email(firstName, lastName),
    ...props,
  };
};
