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
  forAdminPage,
}: {
  data: RouterOutputs["organizations"]["get"];
  forAdminPage?: boolean;
}) => {
  if (!data) {
    return null;
  }

  return (
    <Container maxW="container.md" mt={16} pb={16}>
      {!forAdminPage ? (
        <Link href="/" color="gray" as={NextLink}>
          Wróć
        </Link>
      ) : null}
      <Heading as="h1" mt={4}>
        {data.name}
      </Heading>
      <Wrap mt={2}>
        {data.Tags.map((tag) => (
          <WrapItem key={tag}>
            <Tag tag={tag} />
          </WrapItem>
        ))}
      </Wrap>
      <Text mt={8}>{data.description}</Text>
      <OrganisationStats
        members={data.numberOfUsers}
        createdAt={data.createdAt}
        numberOfProjects={data.Projects.length}
      />
      <br />
      <Text>{data.longDescription}</Text>
      <Heading as="h2" size="md" mt={4} mb={2}>
        Zarząd
      </Heading>
      <UnorderedList>
        {data.Managers.map((member) => (
          <ListItem key={member.id}>{member.name}</ListItem>
        ))}
      </UnorderedList>
      <Heading as="h2" size="md" mt={4} mb={2}>
        Kontakt
      </Heading>
      <List>
        {data.ContactMethods.map((contactMethod) => (
          <ListItem key={contactMethod.id}>
            <HStack>
              <Text textTransform="capitalize">
                {contactMethod.contactType}:
              </Text>
              <Link
                href={contactMethod.contactLink}
                target="_blank"
                color="gray"
              >
                {contactMethod.contactLink}
              </Link>
            </HStack>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};
