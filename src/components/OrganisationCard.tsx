import { Text, VStack, HStack, LinkBox, LinkOverlay } from "@chakra-ui/react";
import NextLink from "next/link";
import type { StudentOrganization } from "@/lib/types";
import Image from "next/image";

export const OrganisationCard = ({
  organization,
}: {
  organization: StudentOrganization;
}) => {
  return (
    <LinkBox
      _hover={{
        backgroundColor: "gray.50",
      }}
      transition="all ease-in-out 0.2s"
      as="article"
      p={6}
      w={{ base: "100%", sm: "400px" }}
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
            <LinkOverlay
              as={NextLink}
              href={
                {
                  pathname: "/organizacja/[id]",
                  query: { id: organization.id },
                } as never
              }
              _hover={{
                textDecoration: "underline",
              }}
              fontWeight="semibold"
              fontSize="lg"
            >
              {organization.name}
            </LinkOverlay>
            {/* <Wrap pt={2} direction="row">
              {organization.tags?.map((tag) => (
                <WrapItem key={tag}>
                  <Tag tag={tag} />
                </WrapItem>
              ))}
            </Wrap> */}
          </VStack>
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
              alt={`Logo ${organization.name}`}
            />
          ) : null}
        </HStack>
        <Text pt={4} color="GrayText" noOfLines={10} wordBreak="break-word">
          {organization.shortDescription}
        </Text>
      </VStack>
    </LinkBox>
  );
};
