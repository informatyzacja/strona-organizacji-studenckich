import { Container, Heading, Box, Flex } from "@chakra-ui/react";
import React from "react";
import Image from "next/image";
import type { StudentOrganization } from "@/lib/types";

const Show = <T,>({
  children,
  when,
}: {
  children?: React.ReactNode;
  when?: T;
}) => {
  if (!when) {
    return null;
  }

  return <>{children}</>;
};

export const OrganisationFull = ({
  organization,
}: {
  organization: StudentOrganization;
}) => {
  return (
    <Container maxW="container.md" mt={16} pb={16} whiteSpace="pre-wrap">
      <Box>
        <Flex align="center" justifyContent="space-between">
          <Heading as="h1" fontSize={["large", "xx-large"]} mt={4}>
            {organization.name}
          </Heading>
          {organization.logoUrl ? (
            <Image
              src={organization.logoUrl}
              width={100}
              height={100}
              style={{
                margin: "0.6rem",
                height: "6.25rem",
                width: "6.25rem",
                objectFit: "contain",
              }}
              priority={true}
              alt={`Logo ${organization.name}`}
            />
          ) : null}
        </Flex>
      </Box>

      {/* <Show when={organization.shortDescription}>
        <Text textAlign="justify" color="gray.600" mt={4}>
          {organization.shortDescription}
        </Text>
      </Show> */}

      <Show when={organization.description}>
        <Heading as="h2" size="md" mt={5} mb={2}>
          Opis organizacji
        </Heading>
        <Box
          as="div"
          dangerouslySetInnerHTML={{ __html: organization.description || "" }}
        />
      </Show>

      {organization.coverUrl ? (
        <Box mt={6}>
          {/* <Heading as="h2" size="md" mt={4} mb={2}>
            Zdjęcie organizacji
          </Heading> */}
          <Image
            src={organization.coverUrl}
            width={800}
            height={400}
            style={{
              width: "100%",
              height: "auto",
              objectFit: "cover",
              borderRadius: "8px",
            }}
            alt={`Zdjęcie ${organization.name}`}
          />
        </Box>
      ) : null}
    </Container>
  );
};
