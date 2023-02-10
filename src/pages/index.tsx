import { List } from "@/components/List";
import { Search } from "@/components/Search";
import { useSearch } from "@/hooks/useSearch";
import { api } from "@/utils/api";
import { Container, VStack, Heading, Tag } from "@chakra-ui/react";
import { type NextPage } from "next";

const Home: NextPage = () => {
  const { data } = api.organizations.getAll.useQuery();

  const { search, setSearch, results } = useSearch(data);

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
          <List pt={8} data={results} />
        </VStack>
      </Container>
    </>
  );
};

export default Home;
