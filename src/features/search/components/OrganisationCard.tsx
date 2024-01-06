import { Button, Text, Wrap, WrapItem, VStack, HStack } from "@chakra-ui/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { Tag } from "./Tag";

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
  const router = useRouter();

  return (
    <VStack
      p={6}
      w="400px"
      h="28rem"
      shadow="md"
      justify="space-between"
      align="start"
    >
      <VStack justifyContent="flex-start" align="start">
        <HStack w="100%" justify="space-between" align="start">
          <VStack justifyContent="flex-start" align="start">
            <Text fontSize="sm">{residence}</Text>
            <Text fontWeight="semibold" fontSize="lg">
              {name}
            </Text>
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
      <HStack mt="auto" spacing={4} justify="start">
        <Button
          colorScheme="blue"
          onClick={() => {
            void router.push({
              pathname: "/organizacja/[slug]",
              query: { slug },
            });
          }}
        >
          Zobacz
        </Button>
      </HStack>
    </VStack>
  );
};
