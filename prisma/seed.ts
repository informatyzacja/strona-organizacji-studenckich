import slugify from "slugify";
import { prisma } from "../src/server/db";
import { organizationFactory } from "./models/organization.factory";
import { userFactory } from "./models/user.factory";
import seedData from "./seed_new.json";

import fs from "fs";
import path from "path";

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
      organization.contact.website,
      organization.contact.facebook,
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
      const logo = findLogo(organization);
      if (logo) {
        addedLogos.push(logo);
      }
      const contactMethods: { contactType: string; contactLink: string }[] = [];
      if (organization.contact) {
        for (const [contactType, contactLink] of Object.entries(
          organization.contact
        )) {
          contactMethods.push({
            contactType,
            contactLink: contactLink as string,
          });
        }
      }

      await prisma.organization.create({
        data: organizationFactory({
          name: organization.name,
          slug: slugify(organization.name),
          type: organization.type,
          fieldOfStudy: organization.field,
          description: organization.shortDescription,
          longDescription: organization.longDescription,
          skillsAndChallenges: organization.skillsAndChallenges,
          achievements: organization.achievements,
          distinguishingFeatures: organization.distinguishingFeatures,
          areasOfInterest: organization.areasOfInterest,
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
          photos: organization.photos,
          ContactMethods: {
            createMany: {
              data: contactMethods,
            },
          },
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
