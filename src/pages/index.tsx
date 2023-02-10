import { Organisation } from "@/components/Organisation";
import { api } from "@/utils/api";
import { InfoOutlineIcon, SearchIcon } from "@chakra-ui/icons";
import {
  Container,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  Text,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { type NextPage } from "next";
import { useMemo, useState } from "react";

const Home: NextPage = () => {
  const { data } = api.organizations.getAll.useQuery();
  const [search, setSearch] = useState("");

  const filteredData = useMemo(
    () =>
      data?.filter(
        (org) =>
          org.description.toLowerCase().includes(search.toLowerCase()) ||
          org.name.toLowerCase().includes(search.toLowerCase()) ||
          org.tags.some((tag) =>
            tag.toLowerCase().includes(search.toLowerCase())
          )
      ),
    [data, search]
  );

  return (
    <>
      <Container maxW="container.xl">
        <VStack w="100%" align="center">
          <InputGroup maxW="3xl" mt={12}>
            <Input
              placeholder="Wyszukaj organizacje"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
            <InputRightElement>
              <SearchIcon />
            </InputRightElement>
          </InputGroup>
          {filteredData?.length === 0 ? (
            <VStack>
              <InfoOutlineIcon mt={16} />
              <Text size="md">
                Brak organizacji, które spełniają twoje zapytanie
              </Text>
            </VStack>
          ) : null}
          <Wrap spacing={8} mx="auto" justify="center">
            {filteredData?.map((org) => (
              <WrapItem key={org.id}>
                <Organisation {...org} />
              </WrapItem>
            ))}
          </Wrap>
        </VStack>
      </Container>
    </>
  );
};

export default Home;
