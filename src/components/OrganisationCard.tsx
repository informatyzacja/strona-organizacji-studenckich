import {
  Text,
  Wrap,
  WrapItem,
  VStack,
  HStack,
  LinkBox,
  LinkOverlay,
} from "@chakra-ui/react";
import Image from "next/image";
import { Tag } from "./Tag";
import NextLink from "next/link";

export const OrganisationCard = ({
  name,
  description,
  logoUrl,
  slug,
  residence,
  tags,
}: {
  name: string;
  description: string;
  logoUrl: string | null;
  slug: string;
  residence?: string;
  tags: string[];
}) => {
  return (
    <LinkBox
      _hover={{
        backgroundColor: "gray.50",
      }}
      transition="all ease-in-out 0.2s"
      as="article"
      p={6}
      maxW="400px"
      height={{
        base: "auto",
        md: "28rem",
      }}
      maxH="28rem"
      shadow="md"
    >
      <VStack justifyContent="flex-start" align="start">
        <HStack w="100%" justify="space-between" align="start">
          <VStack justifyContent="flex-start" align="start">
            <Text fontSize="sm">{residence}</Text>
            <LinkOverlay
              as={NextLink}
              href={
                {
                  pathname: "/organizacja/[slug]",
                  query: { slug },
                } as never
              }
              _hover={{
                textDecoration: "underline",
              }}
              fontWeight="semibold"
              fontSize="lg"
            >
              {name}
            </LinkOverlay>
            <Wrap pt={2} direction="row">
              {tags.map((tag) => (
                <WrapItem key={tag}>
                  <Tag tag={tag} />
                </WrapItem>
              ))}
            </Wrap>
          </VStack>
          {logoUrl ? (
            <Image
              src={logoUrl}
              width={100}
              height={100}
              style={{
                margin: "0.6rem",
                height: "6.25rem",
                width: "6.25rem",
                objectFit: "contain",
              }}
              alt={`Logo ${name}`}
            />
          ) : null}
        </HStack>
        <Text pt={4} color="GrayText">
          {description}
        </Text>
      </VStack>
    </LinkBox>
  );
};
