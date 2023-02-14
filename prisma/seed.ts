import { prisma } from "../src/server/db";
import { organizationFactory } from "./models/organization.factory";

async function main() {
  await prisma.organization.deleteMany();

  const numberOfOrganizations = 100;

  for (let i = 0; i < numberOfOrganizations; i++) {
    await prisma.organization.create({
      data: organizationFactory(),
    });
  }

  console.log(`Created ${numberOfOrganizations} organizations`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
