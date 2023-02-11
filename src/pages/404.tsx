import { Box, Heading, Text, Link } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";

const NotFound = () => {
  return (
    <Box textAlign="center" py={10} px={6} mt={16}>
      <Heading display="inline-block" as="h2" size="2xl" colorScheme="blue">
        404
      </Heading>
      <Text fontSize="lg" mt={3} mb={2}>
        Nie znaleziono strony
      </Text>
      <Text color={"gray.500"} mb={14}>
        Strona, której szukasz prawodopodobnie nie istnieje lub została
        usunięta.
      </Text>

      <Link as={NextLink} href="/" colorScheme="blue" variant="solid">
        Wróć do strony głównej
      </Link>
    </Box>
  );
};

export default NotFound;
