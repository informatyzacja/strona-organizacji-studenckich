import { faker } from "@faker-js/faker/locale/pl";
import type { Prisma } from "@prisma/client";
import slugify from "slugify";
import { contactMethodFactory } from "./contactMethod.factory";
import { tagFactory } from "./tag.factory";
import { userFactory } from "./user.factory";

const departments = [
  "W1 - Wydział Architektury",
  "W2 - Wydział Budownictwa Lądowego i Wodnego",
  "W3 - Wydział Chemiczny",
  "W4 - Wydział Informatyki i Telekomunikacji",
  "W5 - Wydział Elektryczny",
  "W6 - Wydział Geoinżynierii, Górnictwa i Geologii",
  "W7 - Wydział Inżynierii Środowiska",
  "W8 - Wydział Zarządzania",
  "W9 - Wydział Mechaniczno-Energetyczny",
  "W10 - Wydział Mechaniczny",
  "W11 - Wydział Podstawowych Problemów Techniki",
  "W12 - Wydział Elektroniki, Fotoniki i Mikrosystemów",
  "W13 - Wydział Matematyki",
  "FLG - Filia W Legnicy",
  "FJG - Filia W Jeleniej Górze",
  "FWB - Filia w Wałbrzychu",
];

const organisationTypes = [
  "Agenda Kultury",
  "Koło Naukowe",
  "Media Studenckie",
  "Organizacja Studencka",
  "Strategiczne Koło Naukowe",
  "Samorząd Studencki",
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
    logoUrl: "/test_logo.png",
    type: faker.helpers.arrayElement(organisationTypes),
    fieldOfStudy: faker.name.jobArea(),
    slug: slugify(name) + faker.random.numeric(4),
    foundationDate: faker.date.past(),
    department: faker.helpers.arrayElement(departments),
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
    ...props,
  };
};
