import type { DefaultSeoProps } from "next-seo";

export const siteConfig = {
  title: "Aktywni na PWr",
  titleTemplate: "%s | Aktywni na PWr",
  canonical: "https://aktywni.pwr.edu.pl",
  description:
    "Strona do wyszukiwania organizacji studenckich w obrębie Politechniki Wrocławskiej",
  openGraph: {
    locale: "pl_PL",
    title: "Aktywni na PWr",
    siteName: "Aktywni",
    type: "website",
    images: [
      {
        url: "https://aktywni.pwr.edu.pl/api/og",
        width: 1200,
        height: 630,
        alt: "Aktywni na PWr",
      },
    ],
  },
} satisfies DefaultSeoProps;
