import { trpcClient } from "@/server/client";
import { directusFileUrl } from "@/utils/directus";
import { ImageResponse } from "next/og";
import { z } from "zod";
import { PwrLogo } from "./PwrLogo";

async function loadGoogleFont(
  font: string,
  text: string = "aąźęłbcdefghijklmnopqrstuvwxyz",
) {
  const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(
    text,
  )}`;

  console.log(url);
  const css = await (await fetch(url)).text();

  const resource = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/,
  );

  if (resource) {
    const res = await fetch(resource[1]);
    if (res.status == 200) {
      return await res.arrayBuffer();
    }
  }

  throw new Error("failed to load font data");
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  const slug = url.searchParams.get("org");
  const googleFont = await loadGoogleFont("Inter");
  const latoFont = await loadGoogleFont("Lato");
  const ralewayFont = await loadGoogleFont("Raleway");
  if (!slug) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 40,
            display: "flex",
            color: "black",
            flexDirection: "column",
            background: "white",
            width: "100%",
            height: "100%",

            textAlign: "center",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "Lato",
          }}
        >
          <img
            src="https://i.imgur.com/isIDXkL.jpeg"
            style={{
              width: "100%",
              position: "absolute",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: 12,

              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
              width: 1000,
            }}
            tw="bg-gray-100 bg-opacity-95"
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <h1
                style={{
                  fontFamily: "Raleway",
                  fontWeight: "bold",
                }}
              >
                Aktywni na
              </h1>
              <PwrLogo
                style={{
                  marginLeft: 90,
                  marginBottom: 45,
                  transform: "scale(1.2)",
                }}
              />
            </div>
            <p
              style={{
                fontWeight: 100,
              }}
            >
              🌟 Organizacje Studenckie na PWr 🌟
            </p>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            data: latoFont,
            name: "Lato",
          },
          {
            data: ralewayFont,
            name: "Raleway",
          },
        ],
        emoji: "twemoji",
      },
    );
  }

  const org = await trpcClient.organizations.get.fetch({ slug });

  const ogImageSchema = z.object({
    heading: z.string(),
    mode: z.string(),
    org: z.string(),
  });
  const values = ogImageSchema.parse({
    ...Object.fromEntries(url.searchParams),
    mode: "white",
    heading: org.name,
  });
  const heading =
    values.heading.length > 40
      ? `${values.heading.substring(0, 140)}...`
      : values.heading;

  const { mode } = values;
  const paint = mode === "dark" ? "#fff" : "#000";

  const fontSize =
    heading.length > 20 ? (heading.length > 40 ? "50px" : "70px") : "100px";

  return new ImageResponse(
    (
      <div
        tw="flex relative flex-col p-12 w-full h-full items-start"
        style={{
          color: paint,
          background:
            mode === "dark"
              ? "linear-gradient(90deg, #000 0%, #111 100%)"
              : "white",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            width: "100%",
          }}
        >
          <img
            src={directusFileUrl(org.logo)}
            style={{
              height: 200,
              maxWidth: 500,
              objectFit: "contain",
            }}
          />
          <PwrLogo />
        </div>
        <div tw="flex flex-col flex-1 py-10">
          <div
            tw="flex leading-[1.1] text-[80px] font-bold"
            style={{
              fontFamily: "Cal Sans",
              fontWeight: "bold",
              marginLeft: "-3px",
              fontSize,
            }}
          >
            {org.name}
          </div>
          <div
            tw="flex text-xl uppercase font-bold tracking-tight"
            style={{ fontFamily: "Inter", fontWeight: "normal" }}
          >
            {org.field}
          </div>
        </div>
        <div tw="flex items-center w-full justify-between">
          <div
            tw="flex text-xl"
            style={{ fontFamily: "Inter", fontWeight: "normal" }}
          >
            aktywni.pwr.edu.pl
          </div>
          <div
            tw="flex items-center text-xl"
            style={{ fontFamily: "Inter", fontWeight: "normal" }}
          >
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
              <path
                d="M30 44v-8a9.6 9.6 0 0 0-2-7c6 0 12-4 12-11 .16-2.5-.54-4.96-2-7 .56-2.3.56-4.7 0-7 0 0-2 0-6 3-5.28-1-10.72-1-16 0-4-3-6-3-6-3-.6 2.3-.6 4.7 0 7a10.806 10.806 0 0 0-2 7c0 7 6 11 12 11a9.43 9.43 0 0 0-1.7 3.3c-.34 1.2-.44 2.46-.3 3.7v8"
                stroke={paint}
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M18 36c-9.02 4-10-4-14-4"
                stroke={paint}
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <div tw="flex ml-2">
              github.com/informatyzacja/strona-organizacji-studenckich
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          data: googleFont,
          name: "Inter",
        },
      ],
    },
  );
}
