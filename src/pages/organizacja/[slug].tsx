import React from "react";
import { Layout } from "@/components/Layout";
import { trpcClient } from "@/server/client";
import type { GetStaticPaths, InferGetStaticPropsType } from "next";
import { OrganisationFull } from "@/components/OrganisationFull";

const OrganisationPage = ({
  data,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <Layout>
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
