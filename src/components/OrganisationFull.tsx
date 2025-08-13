import { Container, Heading, Text, Box, Flex } from "@chakra-ui/react";
import React from "react";
// import Image from "next/image";
import type { StudentOrganization } from "@/types";

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

// TODO: add images

export const OrganisationFull = ({ data }: { data: StudentOrganization }) => {
  return (
    <Container maxW="container.md" mt={16} pb={16} whiteSpace="pre-wrap">
      <Box>
        <Flex align="center" justifyContent="space-between">
          <Heading as="h1" fontSize={["large", "xx-large"]} mt={4}>
            {data.name}
          </Heading>
          {/* {data.logoKey ? (
            <Image
              src={`https://api.topwr.solvro.pl/api/v1/files/${data.logoKey}`}
              width={100}
              height={100}
              style={{
                margin: "0.6rem",
                height: "6.25rem",
                width: "6.25rem",
                objectFit: "contain",
              }}
              priority={true}
              alt={`Logo ${data.name}`}
            />
          ) : null} */}
        </Flex>
      </Box>

      <Show when={data.shortDescription}>
        <Heading as="h2" size="md" mt={5} mb={2}>
          Krótki opis
        </Heading>
        <Text textAlign="justify">{data.shortDescription}</Text>
      </Show>

      <Show when={data.description}>
        <Heading as="h2" size="md" mt={5} mb={2}>
          Opis organizacji
        </Heading>
        <Text textAlign="justify">{data.description}</Text>
      </Show>

      {/* {data.coverKey ? (
        <Box mt={6}>
          <Heading as="h2" size="md" mt={4} mb={2}>
            Zdjęcie organizacji
          </Heading>
          <Image
            src={`https://api.topwr.solvro.pl/api/v1/files/${data.coverKey}`}
            width={800}
            height={400}
            style={{
              width: "100%",
              height: "auto",
              objectFit: "cover",
              borderRadius: "8px",
            }}
            alt={`Zdjęcie ${data.name}`}
          />
        </Box>
      ) : null} */}
    </Container>
  );
};
