import type { ApiCollections } from "@/utils/api-collection";
import {
  authentication,
  createDirectus,
  createItem,
  deleteFiles,
  deleteItems,
  readFiles,
  rest,
  uploadFiles,
} from "@directus/sdk";
import fs from "node:fs";
import sosData from "./sos_image_data/updated_data.json";
import path from "node:path";
import slugify from "slugify";

type NoUndefinedField<T> = {
  [P in keyof T]-?: NoUndefinedField<Exclude<T[P], undefined>>;
};

const getFilenameWithoutExtension = (filename: string) => {
  return filename.split(".")[0];
};

const findFilename = (filename: string, filenames: string[]) => {
  return filenames.find(
    (photoFilename) =>
      getFilenameWithoutExtension(photoFilename) ===
      getFilenameWithoutExtension(filename),
  );
};

const CONFIG = {
  DIRECTUS_URL: "https://directus.universe.nexus",
  ADMIN_EMAIL: "FILL_ME_IN",
  ADMIN_PASSWORD: "FILL_ME_IN",
  LOGO_FOLDER_ID: "79d440d6-07f6-47ed-8448-57587f27e706",
  ZDJECIA_FOLDER_ID: "9c6b972a-dceb-4f2b-b267-b472041f3c83",
};

const main = async () => {
  const client = createDirectus<NoUndefinedField<ApiCollections>>(
    CONFIG.DIRECTUS_URL,
  )
    .with(rest())
    .with(authentication("json"));

  if (
    CONFIG.ADMIN_EMAIL === "FILL_ME_IN" ||
    CONFIG.ADMIN_PASSWORD === "FILL_ME_IN"
  ) {
    throw new Error(
      "Please fill in the admin email and password in scripts/loadData.ts",
    );
  }

  await client.login(CONFIG.ADMIN_EMAIL, CONFIG.ADMIN_PASSWORD);

  await client.request(
    deleteItems("Organizacje", {
      limit: 100,
    }),
  );
  await client.request(deleteItems("Organizacje_files", { limit: 10000 }));

  const allFiles = await client.request(readFiles());
  await client.request(deleteFiles(allFiles.map((file) => file.id)));

  const logoFolderId = CONFIG.LOGO_FOLDER_ID;
  const zdjeciaFolderId = CONFIG.ZDJECIA_FOLDER_ID;

  const uploadFile = (filepath: string, type: "logo" | "zdjecia") => {
    const filename = filepath.split("/").pop();
    if (!filename) {
      throw new Error("Invalid filepath");
    }

    const file = new Blob([fs.readFileSync(filepath)], {
      type: "image/jpeg",
    });

    const formData = new FormData();
    formData.append("folder", type === "logo" ? logoFolderId : zdjeciaFolderId);
    formData.append("file", file, filename);

    return client.request(uploadFiles(formData));
  };

  const photosDir = path.join(__dirname, "./sos_image_data/photos");
  const logosDir = path.join(__dirname, "./sos_image_data/logos");

  const allLogos = fs.readdirSync(logosDir);
  const allPhotos = fs.readdirSync(photosDir);
  const createdOrgs = [];

  for (const org of sosData) {
    console.log("starting ", org.name);
    const orgData = async () => {
      const output = {
        name: org.name,
        shortDescription: org.shortDescription,
        longDescription: org.longDescription,
        skillsAndChallenges: org.skillsAndChallenges,
        achievements: org.achievements,
        distinguishingFeatures: org.distinguishingFeatures,
        areasOfInterest: org.areasOfInterest,
        field: org.field,
        email: org.email,
        website: org.contact.website,
        linkedin: org.contact.linkedin,
        facebook: org.contact.facebook,
        instagram: org.contact.instagram,
        youtube: org.contact.youtube,
        slug: slugify(org.name, { lower: true }),
      };

      if (org.logoUrl) {
        const logoFileUpload = await uploadFile(
          `${logosDir}/${findFilename(org.logoUrl, allLogos)}`,
          "logo",
        ).catch((err) => {
          console.error(err);
          throw err;
        });
        return {
          ...output,
          logo: logoFileUpload.id,
        };
      }
      return output;
    };

    console.log(org.name);

    const createdOrg = await client.request(
      createItem("Organizacje", await orgData()),
    );
    createdOrgs.push(createdOrg);

    await Promise.all(
      org.photos.map(async (photo) => {
        const file = await uploadFile(
          `${photosDir}/${findFilename(photo, allPhotos)}`,
          "zdjecia",
        ).catch((err) => {
          console.error(err);
          throw err;
        });

        await client.request(
          createItem("Organizacje_files", {
            Organizacje_id: createdOrg.id,
            directus_files_id: file.id,
          }),
        );
      }),
    );

    console.log("done photos");
  }

  fs.writeFileSync("orgs.json", JSON.stringify(createdOrgs, null, 2));
};

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});
