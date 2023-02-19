import slugify from "slugify";
import { prisma } from "../src/server/db";
import { organizationFactory } from "./models/organization.factory";
import { userFactory } from "./models/user.factory";
import seedData from "./seed.json";

async function main() {
  await prisma.organization.deleteMany();

  for (let i = 0; i < seedData.length; i++) {
    const organization = seedData.at(i);

    if (organization) {
      const shortDescription =
        organization.description.length > 200
          ? organization.description.slice(0, 200).trim() + "..."
          : organization.description;

      await prisma.organization.create({
        data: organizationFactory({
          name: organization.name,
          slug: slugify(organization.name),
          type: organization.organisation,
          department: organization.department,
          description: shortDescription,
          longDescription: organization.description,
          owner: {
            connectOrCreate: {
              where: {
                email: organization.email,
              },
              create: userFactory({
                name: organization.name,
                role: "OWNER",
                email: organization.email,
              }),
            },
          },
          ContactMethods: {},
        }),
      });
    }
  }

  console.log(`Created ${seedData.length} organizations`);
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
