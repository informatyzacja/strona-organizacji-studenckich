import {
  Stack,
  Heading,
  Button,
  Text,
  Badge,
  Center,
  Flex,
  useColorModeValue,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";

import NextImage from "next/image";

const Tag = ({ tag }: { tag: string }) => {
  return (
    <Badge
      px={2}
      py={1}
      bg={useColorModeValue("gray.50", "gray.800")}
      fontWeight={"400"}
    >
      {tag}
    </Badge>
  );
};

export const Organisation = ({
  name,
  description,
  logoUrl,
  tags,
}: {
  name: string;
  description: string;
  logoUrl: string;
  tags: string[];
}) => {
  return (
    <Center py={6}>
      <Stack
        borderWidth="1px"
        borderRadius="lg"
        w={{ sm: "100%", md: "540px" }}
        height={{ sm: "476px", md: "20rem" }}
        direction={{ base: "column", md: "row" }}
        bg={useColorModeValue("white", "gray.900")}
        boxShadow={"sm"}
        padding={4}
      >
        <Flex flex={1} bg="blue.200" borderRadius="lg" justify="center">
          <NextImage
            style={{
              objectFit: "cover",
              objectPosition: "center",
              borderRadius: "0.5rem",
            }}
            alt={name}
            width={300}
            height={300}
            src={logoUrl}
          />
        </Flex>
        <Stack
          flex={1}
          maxW="300px"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          p={1}
        >
          <Stack pt={3}>
            <Heading fontSize={"xl"} fontFamily={"body"} textAlign="center">
              {name}
            </Heading>
            <Text
              textAlign={"center"}
              color={useColorModeValue("gray.700", "gray.400")}
              px={3}
            >
              {description}
            </Text>
            <Wrap align={"center"} justify={"center"} direction={"row"} mt={6}>
              {tags.map((tag) => (
                <WrapItem key={tag}>
                  <Tag tag={tag} />
                </WrapItem>
              ))}
            </Wrap>
          </Stack>
          <Stack
            width={"100%"}
            direction={"row"}
            padding={2}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <Button
              flex={1}
              fontSize={"sm"}
              bg={"blue.400"}
              color={"white"}
              _hover={{
                bg: "blue.500",
              }}
              _focus={{
                bg: "blue.500",
              }}
            >
              Więcej informacji
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Center>
  );
};
