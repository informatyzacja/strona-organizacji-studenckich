import { Loading } from "@/components/Loading";
import { Tag } from "@/features/search";
import NotFound from "@/pages/404";
import { api } from "@/utils/api";
import { Heading } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";
import { Layout } from "../../components/Layout";
import { OrganizationsTable } from "../../components/OrganizationsTable";

export const GetTagPage = () => {
  const router = useRouter<"/admin/tagi/[text]">();
  const { text } = router.query;

  const { data, isLoading } = api.tags.get.useQuery({
    text,
  });

  if (isLoading) {
    return <Loading />;
  }

  if (!data) {
    return <NotFound />;
  }

  return (
    <Layout>
      <Heading size="lg" mb={4}>
        Organizacje z tagiem
        <Tag size="lg" ml={3} px={3} mt={1} tag={data.text} />
      </Heading>
      <OrganizationsTable
        data={data.organizations.map((organization) => ({
          ...organization,
          Tags: organization.Tags.map((tag) => tag.text),
        }))}
      />
    </Layout>
  );
};
