import React from "react";
import { Layout } from "@/components/Layout";
import { trpcClient } from "@/server/client";
import type { GetStaticPaths, InferGetStaticPropsType } from "next";
import { OrganisationFull } from "@/components/OrganisationFull";
import { NextSeo } from "next-seo";
import { siteConfig } from "@/config";

const OrganisationPage = ({
  data,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <Layout>
      <NextSeo
        title={data.name}
        description={
          data.shortDescription && data.shortDescription?.length > 120
            ? data.shortDescription.slice(0, 120) + "..."
            : data.shortDescription
        }
        openGraph={{
          locale: "pl_PL",
          type: "website",
          images: [
            {
              url: `${siteConfig.canonical}/api/og?org=${data.slug}`,
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
  const data = await trpcClient.organizations.list.fetch();

  const paths = data.map((org) => ({
    params: { slug: org.slug },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = async ({
  params,
}: {
  params: { slug: string };
}) => {
  const { slug } = params;
  const data = await trpcClient.organizations.get.fetch({ slug });
  return {
    props: { data },
  };
};
