import { useRouter } from "next/router";
import React from "react";
import {
  Container,
  Heading,
  Text,
  Wrap,
  WrapItem,
  Link,
  ListItem,
  UnorderedList,
  List,
  HStack,
  ScaleFade,
} from "@chakra-ui/react";
import { api } from "@/utils/api";
import { Tag } from "@/components/Tag";
import NextLink from "next/link";
import { OrganisationStats } from "@/components/OrganisationStats";
import NotFound from "../404";
import { Loading } from "@/components/Loading";

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
    <ScaleFade in={true}>
      <Container maxW="container.md" mt={16} pb={16}>
        <Link href="/" color="gray" as={NextLink}>
          Wróć
        </Link>
        <Heading as="h1" mt={4}>
          {data.name}
        </Heading>
        <Wrap mt={2}>
          {data.tags.map((tag) => (
            <WrapItem key={tag}>
              <Tag tag={tag} />
            </WrapItem>
          ))}
        </Wrap>
        <Text mt={8}>{data.description}</Text>
        <OrganisationStats
          members={data.members}
          createdAt={data.createdAt}
          numberOfProjects={data.numberOfProjects}
        />
        <br />
        <Text>{data.longDescription}</Text>
        <Heading as="h2" size="md" mt={4} mb={2}>
          Zarząd
        </Heading>
        <UnorderedList>
          {data.management.map((member) => (
            <ListItem key={member}>{member}</ListItem>
          ))}
        </UnorderedList>
        <Heading as="h2" size="md" mt={4} mb={2}>
          Kontakt
        </Heading>
        <List>
          {Object.entries(data.socials).map(([key, value]) => (
            <ListItem key={key}>
              <HStack>
                <Text textTransform="capitalize">{key}:</Text>
                <Link href={value} target="_blank" color="gray">
                  {value}
                </Link>
              </HStack>
            </ListItem>
          ))}
        </List>
      </Container>
    </ScaleFade>
  );
};

export default OrganisationPage;
