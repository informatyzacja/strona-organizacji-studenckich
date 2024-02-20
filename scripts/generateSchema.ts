import "dotenv/config";
import fs from "fs";

import { env } from "@/env.mjs";

const main = async () => {
  const result = await fetch(
    `${env.NEXT_PUBLIC_DIRECTUS_URL}/server/specs/graphql/`,
  );

  fs.writeFileSync("./schema.graphql", await result.text());
};

void main();
