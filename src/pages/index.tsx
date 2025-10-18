import { AnimatePresenceSSR } from "@/components/AnimatePresenceSSR";
import { Layout } from "@/components/Layout";
import { OrganisationCard } from "@/components/OrganisationCard";

import { InfoOutlineIcon } from "@chakra-ui/icons";
import {
  Container,
  VStack,
  Heading,
  Tag,
  Box,
  Wrap,
  WrapItem,
  Text,
  Button,
  HStack,
  Input,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import type { PaginationInfo, StudentOrganization } from "@/lib/types";
import type { InferGetServerSidePropsType } from "next";
import { useState } from "react";
import { fetchImageUrl, fetchQuery } from "@/lib/helpers";
import { STUDENT_ORGANIZATIONS_API_PATH } from "@/lib/config";

const PAGE_LIMIT = 10;

export default function SearchPage({
  initialOrganizations,
  initialPaginationInfo,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [organizations, setOrganizations] = useState(initialOrganizations);
  const [paginationInfo, setPaginationInfo] = useState(initialPaginationInfo);
  const [query, setQuery] = useState("");

  async function searchOrganizations(query: string) {
    const { data, meta } = await fetchOrganizations({
      query,
      pagination: {
        page: 1,
        limit: PAGE_LIMIT,
      },
    });
    setOrganizations(data);
    setPaginationInfo(meta);
  }

  async function loadMore() {
    const { data, meta } = await fetchOrganizations({
      query,
      pagination: {
        page: paginationInfo.currentPage + 1,
        limit: PAGE_LIMIT,
      },
    });
    setOrganizations((prev) => [...prev, ...data]);
    setPaginationInfo(meta);
  }

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

          <HStack w="80%" pb={8}>
            <Input
              placeholder="Szukaj organizacji..."
              value={query}
              onChange={(e) => {
                const value = e.target.value;
                setQuery(value);
                void searchOrganizations(value);
              }}
            />
          </HStack>

          <Box>
            <AnimatePresenceSSR>
              {organizations?.length === 0 ? (
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
              {organizations && organizations?.length > 0 ? (
                <Text color="GrayText" ml={10} fontSize="sm" alignSelf="start">
                  {paginationInfo.total} wyników
                </Text>
              ) : null}
              <Wrap
                w={{ base: "100%", lg: "900px" }}
                spacing={4}
                mx="auto"
                justify="center"
              >
                <AnimatePresenceSSR mode="popLayout">
                  {organizations.map((org) => (
                    <motion.div
                      key={org.name}
                      layout
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0, dur: 0.1 }}
                      transition={{ type: "spring", duration: 0.4 }}
                    >
                      <WrapItem p={2}>
                        <OrganisationCard organization={org} />
                      </WrapItem>
                    </motion.div>
                  ))}
                </AnimatePresenceSSR>
              </Wrap>
              <Box>
                <Button mt={8} mb={8} onClick={() => loadMore()}>
                  Pokaż więcej
                </Button>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Layout>
  );
}

export const getServerSideProps = async () => {
  const { data, meta } = await fetchOrganizations({
    pagination: {
      page: 1,
      limit: PAGE_LIMIT,
    },
  });
  const organizationsWithLogos = await Promise.all(
    data.map(async (org) => ({
      ...org,
      logoUrl: org.logoKey ? await fetchImageUrl(org.logoKey) : null,
    })),
  );
  return {
    props: {
      initialOrganizations: organizationsWithLogos,
      initialPaginationInfo: meta,
    },
  };
};

async function fetchOrganizations(options?: {
  query?: string;
  pagination?: { page: number; limit: number };
}): Promise<{ data: StudentOrganization[]; meta: PaginationInfo }> {
  const params = new URLSearchParams({ tags: "true" });

  if (options?.query) {
    params.append("name", `%${options?.query}%`);
  }

  if (options?.pagination) {
    params.append("page", options?.pagination.page.toString());
    params.append("limit", options?.pagination.limit.toString());
  }

  return fetchQuery<{ data: StudentOrganization[]; meta: PaginationInfo }>(
    `${STUDENT_ORGANIZATIONS_API_PATH}?${params.toString()}`,
  );
}
