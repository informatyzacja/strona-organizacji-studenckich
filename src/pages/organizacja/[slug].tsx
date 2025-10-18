import React from "react";
import { Layout } from "@/components/Layout";
import type { GetStaticPaths, InferGetStaticPropsType } from "next";
import { OrganisationFull } from "@/components/OrganisationFull";
import { NextSeo } from "next-seo";
import { siteConfig } from "@/config";
import { fetchImageUrl, fetchQuery } from "@/lib/helpers";
import type { StudentOrganization } from "@/lib/types";
import { STUDENT_ORGANIZATIONS_API_PATH } from "@/lib/config";

export default function OrganisationPage({
  organization,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  if (!organization) {
    return (
      <Layout>
        <div>Organization not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <NextSeo
        title={organization.name}
        description={
          organization.shortDescription &&
          organization.shortDescription.length > 120
            ? organization.shortDescription.slice(0, 120) + "..."
            : (organization.shortDescription ?? undefined)
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
            content: `${siteConfig.canonical}/api/og?org=${organization.id}`,
          },
          {
            name: "twitter:title",
            content: organization.name,
          },
          {
            name: "twitter:description",
            content:
              organization.shortDescription &&
              organization.shortDescription.length > 120
                ? organization.shortDescription.slice(0, 120) + "..."
                : (organization.shortDescription ?? "Organizacja studencka"),
          },
        ]}
        openGraph={{
          locale: "pl_PL",
          type: "website",
          images: [
            {
              url: `${siteConfig.canonical}/api/og?org=${organization.id}`,
              width: 1200,
              height: 630,
              alt: organization.name,
            },
          ],
        }}
      />
      <OrganisationFull organization={organization} />
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const { data } = await fetchQuery<{
      data: StudentOrganization[];
    }>(STUDENT_ORGANIZATIONS_API_PATH);

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
  try {
    const { organization } = await fetchOrganization(Number(params.slug));

    if (organization.logoKey) {
      organization.logoUrl = await fetchImageUrl(organization.logoKey);
    }

    if (organization.coverKey) {
      organization.coverUrl = await fetchImageUrl(organization.coverKey);
    }

    return { props: { organization }, revalidate: 3600 };
  } catch {
    return { notFound: true };
  }
};

async function fetchOrganization(
  id: number,
): Promise<{ organization: StudentOrganization }> {
  const data = await fetchQuery<{ data: StudentOrganization }>(
    `${STUDENT_ORGANIZATIONS_API_PATH}/${id}?tags=true`,
  );
  return { organization: data.data };
}
