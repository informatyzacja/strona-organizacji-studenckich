import {
  Button,
  Text,
  Wrap,
  WrapItem,
  VStack,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { FaHeart } from "react-icons/fa";
import { Tag } from "./Tag";

export const OrganisationCard = ({
  name,
  description,
  slug,
  residence,
  Tags,
}: {
  name: string;
  description: string;
  slug: string;
  residence: string;
  Tags: string[];
}) => {
  const router = useRouter();

  return (
    <VStack
      p={6}
      w="400px"
      h="340px"
      shadow="md"
      justify="space-between"
      align="start"
    >
      <VStack justifyContent="flex-start" align="start">
        <Text fontSize="sm">{residence}</Text>
        <Text fontWeight="semibold" fontSize="lg">
          {name}
        </Text>
        <Wrap pt={2} direction="row">
          {Tags.map((tag) => (
            <WrapItem key={tag}>
              <Tag tag={tag} />
            </WrapItem>
          ))}
        </Wrap>
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
        <IconButton icon={<FaHeart />} aria-label="Dodaj do ulubionych" />
      </HStack>
    </VStack>
  );
};
