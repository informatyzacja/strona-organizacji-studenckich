import { List } from "@/components/List";
import { Search } from "@/components/Search";
import { useSelectedTags } from "@/hooks/useSelectedTags";
import { api } from "@/utils/api";
import { Container, VStack, Heading, Tag } from "@chakra-ui/react";
import { type NextPage } from "next";
import { useMemo, useState } from "react";

const Home: NextPage = () => {
  const { data } = api.organizations.getAll.useQuery();
  const [search, setSearch] = useState("");
  const { selectedTags } = useSelectedTags();
  const filteredData = useMemo(
    () =>
      data?.filter(
        (org) =>
          (org.description.toLowerCase().includes(search.toLowerCase()) ||
            org.name.toLowerCase().includes(search.toLowerCase()) ||
            org.tags.some((tag) =>
              tag.toLowerCase().includes(search.toLowerCase())
            )) &&
          selectedTags.every((tag) => org.tags.includes(tag))
      ),
    [data, search, selectedTags]
  );

  return (
    <>
      <Container pt={20} maxW="container.xl">
        <VStack w={{ base: "100%", md: "900px" }} mx="auto" align="center">
          <Tag px={2} mb={2} colorScheme="blue">
            znajdź organizacje dla siebie!
          </Tag>
          <Heading size="lg" fontWeight="semibold" pb={16} textAlign="center">
            Wyszukiwarka organizacji studenckich
          </Heading>
          <Search value={search} setValue={setSearch} />
          <List pt={8} data={filteredData} />
        </VStack>
      </Container>
    </>
  );
};

export default Home;
