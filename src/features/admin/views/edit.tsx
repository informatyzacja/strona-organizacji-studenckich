import { Loading } from "@/components/Loading";
import { OrganisationFull } from "@/features/search";
import NotFound from "@/pages/404";
import { api } from "@/utils/api";
import { useRouter } from "next/router";
import React from "react";
import { Layout } from "../components/Layout";

export const EditPage = () => {
  const router = useRouter<"/admin/organizacje/[slug]">();
  const { slug } = router.query;

  const { data, isLoading } = api.organizations.get.useQuery(
    {
      slug,
    },
    {
      enabled: Boolean(slug),
    }
  );

  if (isLoading) {
    return (
      <Layout>
        <Loading mt={40} />
      </Layout>
    );
  }

  if (!data) {
    return <NotFound />;
  }
  return (
    <Layout>
      <OrganisationFull data={data} />
    </Layout>
  );
};
