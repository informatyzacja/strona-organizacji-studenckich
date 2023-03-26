import slugify from "slugify";
import { prisma } from "../src/server/db";
import { organizationFactory } from "./models/organization.factory";
import { userFactory } from "./models/user.factory";
import seedData from "./seed.json";

import fs from "fs";
import path from "path";
import { Organization } from "@prisma/client";

const logosDir = path.join(__dirname, "./logos");
const availableLogos = fs.readdirSync(logosDir);

const copyLogos = () => {
  const uploadsDir = path.join(__dirname, "../upload/images");

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  fs.cpSync(logosDir + "/", uploadsDir + "/", {
    recursive: true,
  });
};

const findLogo = (organization: (typeof seedData)[number]) => {
  const logo = availableLogos.find((logoFile) => {
    const logoName = logoFile.split(".")[0]?.toLowerCase();

    if (!logoName) {
      return false;
    }

    const placesToCheck = [
      organization.name,
      organization.email,
      organization.website,
      organization.facebook,
    ];

    return placesToCheck.some((place) => {
      if (!place) {
        return false;
      }

      return (
        place.toLowerCase().includes(logoName) ||
        place.split(" ").join("").toLowerCase().includes(logoName)
      );
    });
  });

  return logo;
};

async function main() {
  await prisma.organization.deleteMany();

  const availableLogos = fs.readdirSync(logosDir);

  console.log(`Found ${availableLogos.length} logos`);

  copyLogos();

  const addedLogos = [] as string[];

  for (let i = 0; i < seedData.length; i++) {
    const organization = seedData.at(i);

    if (organization) {
      const shortDescription =
        organization.description.length > 200
          ? organization.description.slice(0, 200).trim() + "..."
          : organization.description;

      const logo = findLogo(organization);

      if (logo) {
        addedLogos.push(logo);
      }

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
          logoUrl: logo ? `/api/file/${logo}` : null,
          ContactMethods: {},
        }),
      });
    }
  }

  console.log(`Created ${seedData.length} organizations`);
  console.log(`Added ${addedLogos.length} logos`);
  const missingLogos = availableLogos.filter(
    (logo) => !addedLogos.includes(logo)
  );
  console.log(`Missing ${missingLogos.length} logos`);
  console.log(missingLogos);
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
