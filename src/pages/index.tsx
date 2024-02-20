import { AnimatePresenceSSR } from "@/components/AnimatePresenceSSR";
import { Layout } from "@/components/Layout";
import { OrganisationCard } from "@/components/OrganisationCard";
import { Search } from "@/components/Search";
import { useNumberOfOrganizationsToShow } from "@/hooks/useNumberOfOrganizationsToShow";
import { useSearch } from "@/hooks/useSearch";
import { trpcClient } from "@/server/client";

import { directusFileUrl } from "@/utils/directus";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import {
  Container,
  VStack,
  Heading,
  Tag,
  Box,
  Button,
  Wrap,
  WrapItem,
  Text,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import type { InferGetServerSidePropsType } from "next";

const SearchPage = ({
  organizations,
  tags,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { numberOfOrganizations, loadMore } = useNumberOfOrganizationsToShow();
  const { search, setSearch, results } = useSearch(organizations);

  return (
    <Layout>
      <Container pt={20} maxW="container.xl">
        <VStack w={{ base: "100%", lg: "900px" }} mx="auto" align="center">
          <Tag px={2} mb={2} colorScheme="blue">
            znajdź organizacje dla siebie!
          </Tag>
          <Heading size="lg" fontWeight="semibold" pb={16} textAlign="center">
            Wyszukiwarka organizacji studenckich
          </Heading>
          <Search tags={tags} value={search} setValue={setSearch} />
          <Box>
            <AnimatePresenceSSR>
              {results?.length === 0 ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", duration: 0.4 }}
                >
                  <VStack>
                    <InfoOutlineIcon mt={16} />
                    <Text size="md">
                      Brak organizacji, które spełniają twoje zapytanie
                    </Text>
                  </VStack>
                </motion.div>
              ) : null}
            </AnimatePresenceSSR>

            <VStack>
              {results && results?.length > 0 ? (
                <Text color="GrayText" ml={10} fontSize="sm" alignSelf="start">
                  {results?.length} wyników
                </Text>
              ) : null}
              <Wrap
                w={{ base: "100%", lg: "900px" }}
                spacing={4}
                mx="auto"
                justify="center"
              >
                <AnimatePresenceSSR mode="popLayout">
                  {results?.slice(0, numberOfOrganizations).map((org) => (
                    <motion.div
                      key={org.name}
                      layout
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0, dur: 0.1 }}
                      transition={{ type: "spring", duration: 0.4 }}
                    >
                      <WrapItem p={2}>
                        <OrganisationCard
                          name={org.name}
                          description={org.shortDescription ?? ""}
                          logoUrl={directusFileUrl(org.logo)}
                          slug={org.slug}
                          tags={org.tags}
                        />
                      </WrapItem>
                    </motion.div>
                  ))}
                </AnimatePresenceSSR>
              </Wrap>
              {results && results?.length > numberOfOrganizations ? (
                <Box>
                  <Button mt={8} mb={8} onClick={() => loadMore()}>
                    Pokaż więcej
                  </Button>
                </Box>
              ) : null}
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Layout>
  );
};

export const getServerSideProps = async () => {
  const organizations = await trpcClient.organizations.list.fetch();
  const tags = await trpcClient.tags.list.fetch();

  return {
    props: { organizations, tags },
  };
};

export default SearchPage;
