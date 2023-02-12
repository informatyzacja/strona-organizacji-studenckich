import type { RouterOutputs } from "@/utils/api";
import {
  Container,
  Link,
  Heading,
  Text,
  Wrap,
  WrapItem,
  UnorderedList,
  ListItem,
  List,
  HStack,
} from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import { OrganisationStats } from "./OrganisationStats";
import { Tag } from "./Tag";

export const OrganisationFull = ({
  data,
}: {
  data: RouterOutputs["organizations"]["get"];
}) => {
  if (!data) {
    return null;
  }

  return (
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
  );
};
