import { useRouter } from "next/router";
import React from "react";
import { ScaleFade } from "@chakra-ui/react";
import { api } from "@/utils/api";
import NotFound from "@/pages/404";
import { Loading } from "../../../components/Loading";
import { Layout } from "../components/Layout";
import { OrganisationFull } from "../components/OrganisationFull";

const OrganisationPage = () => {
  const router = useRouter<"/organizacja/[slug]">();
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
    return <Loading mt={40} />;
  }

  if (!data) {
    return <NotFound />;
  }

  return (
    <Layout>
      <ScaleFade in={true}>
        <OrganisationFull data={data} />
      </ScaleFade>
    </Layout>
  );
};

export default OrganisationPage;
