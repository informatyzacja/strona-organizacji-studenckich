import { Loading } from "@/components/Loading";
import NotFound from "@/pages/404";
import { api } from "@/utils/api";
import { Button, HStack } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";
import { Layout } from "../../components/Layout";
import { OrganizationsTable } from "../../components/OrganizationsTable";

export const OrganizationsPage = () => {
  const { data, isLoading } = api.organizations.list.useQuery();

  const router = useRouter<"/admin">();

  if (isLoading) {
    return <Loading />;
  }

  if (!data) {
    return <NotFound />;
  }

  return (
    <Layout>
      <HStack justify="flex-end">
        <Button
          variant="solid"
          colorScheme="blue"
          onClick={() => {
            void router.push("/admin/organizacje/stworz");
          }}
        >
          Stwórz nowy
        </Button>
      </HStack>
      <OrganizationsTable data={data} />
    </Layout>
  );
};
