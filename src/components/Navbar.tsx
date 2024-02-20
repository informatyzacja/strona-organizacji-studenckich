import { Box, Flex, useColorModeValue } from "@chakra-ui/react";
import NextImage from "next/image";
import logoPwr from "../../public/logo-pwr.svg";
import NextLink from "next/link";

const PwrLogo = () => {
  return (
    <NextLink href="/">
      <NextImage src={logoPwr as string} alt="logo Pwr" />
    </NextLink>
  );
};
export const Navbar = () => {
  return (
    <Box bg={useColorModeValue("white", "gray.800")}>
      <Flex
        mx="auto"
        color={useColorModeValue("gray.600", "white")}
        minH={"60px"}
        py={{ base: 2 }}
        px={{ base: 4, md: 24 }}
        align={"center"}
      >
        <Flex flex={{ base: 1 }} justify={{ base: "center", md: "start" }}>
          <PwrLogo />
        </Flex>
      </Flex>
    </Box>
  );
};
