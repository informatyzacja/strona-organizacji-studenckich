import React from "react";
import { Layout } from "@/components/Layout";
import type { GetStaticPaths, InferGetStaticPropsType } from "next";
import { OrganisationFull } from "@/components/OrganisationFull";
import { NextSeo } from "next-seo";
import { siteConfig } from "@/config";
import type { StudentOrganization } from "@/types";

const OrganisationPage = ({
  data,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  if (!data) {
    return (
      <Layout>
        <div>Organization not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <NextSeo
        title={data.name}
        description={
          data.shortDescription && data.shortDescription.length > 120
            ? data.shortDescription.slice(0, 120) + "..."
            : (data.shortDescription ?? undefined)
        }
        twitter={{
          cardType: "summary_large_image",
        }}
        additionalMetaTags={[
          {
            name: "twitter:site",
            content: siteConfig.title,
          },
          {
            name: "twitter:image:src",
            content: `${siteConfig.canonical}/api/og?org=${data.id}`,
          },
          {
            name: "twitter:title",
            content: data.name,
          },
          {
            name: "twitter:description",
            content:
              data.shortDescription && data.shortDescription.length > 120
                ? data.shortDescription.slice(0, 120) + "..."
                : (data.shortDescription ?? "Organizacja studencka"),
          },
        ]}
        openGraph={{
          locale: "pl_PL",
          type: "website",
          images: [
            {
              url: `${siteConfig.canonical}/api/og?org=${data.id}`,
              width: 1200,
              height: 630,
              alt: data.name,
            },
          ],
        }}
      />
      <OrganisationFull data={data} />
    </Layout>
  );
};

export default OrganisationPage;

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const response = await fetch(
      "https://api.topwr.solvro.pl/api/v1/student_organizations",
      { cache: "no-store" },
    );

    const { data } = (await response.json()) as {
      data: StudentOrganization[];
    };

    const paths = data.map((org) => ({
      params: { slug: org.id.toString() },
    }));

    return {
      paths,
      fallback: "blocking",
    };
  } catch (error) {
    console.error("Error fetching organizations for static paths:", error);
    return {
      paths: [],
      fallback: false,
    };
  }
};

export const getStaticProps = async ({
  params,
}: {
  params: { slug: string };
}) => {
  const { slug } = params;
  const { data } = await fetchStudentOrganizations(slug);

  if (!data) {
    return {
      notFound: true,
    };
  }

  return {
    props: { data },
    revalidate: 3600, // Revalidate every hour
  };
};

async function fetchStudentOrganizations(slug: string) {
  try {
    const response = await fetch(
      `https://api.topwr.solvro.pl/api/v1/student_organizations/${slug}`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch student organizations: ${String(response.status)}`,
      );
    }

    const { data } = (await response.json()) as {
      data: StudentOrganization;
    };

    return { data };
  } catch (error) {
    console.error("Error fetching student organizations:", error);
    return { data: null };
  }
}
