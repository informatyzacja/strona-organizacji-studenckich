import {
  Box,
  chakra,
  Container,
  Stack,
  useColorModeValue,
  VisuallyHidden,
} from "@chakra-ui/react";
import NextImage from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { FaFacebook, FaGithub, FaGlobeEurope } from "react-icons/fa";
import logoDS from "../../public/logo-dzial-studencki.svg";
import logoPwr from "../../public/logo-pwr.svg";
import logoSSPwr from "../../public/logo-sspwr.svg";

const SocialButton = ({
  children,
  label,
  href,
}: {
  children: ReactNode;
  label: string;
  href: string;
}) => {
  return (
    <chakra.button
      bg={useColorModeValue("blackAlpha.100", "whiteAlpha.100")}
      rounded={"full"}
      w={8}
      h={8}
      cursor={"pointer"}
      as={"a"}
      href={href}
      display={"inline-flex"}
      alignItems={"center"}
      justifyContent={"center"}
      transition={"background 0.3s ease"}
      _hover={{
        bg: useColorModeValue("blackAlpha.200", "whiteAlpha.200"),
      }}
    >
      <VisuallyHidden>{label}</VisuallyHidden>
      {children}
    </chakra.button>
  );
};

export const Footer = () => {
  return (
    <Box
      mt="auto"
      bg={useColorModeValue("gray.50", "gray.900")}
      color={useColorModeValue("gray.700", "gray.200")}
    >
      <Container
        as={Stack}
        maxW={"6xl"}
        py={4}
        direction={{ base: "column", md: "row" }}
        spacing={4}
        justify={{ base: "center", md: "space-between" }}
        align={{ base: "center", md: "center" }}
      >
        <NextImage
          src={logoPwr as string}
          alt="logo Politechniki Wrocławskiej"
        />
        <a href="https://samorzad.pwr.edu.pl" target="_blank" rel="noreferrer">
          <NextImage
            src={logoSSPwr as string}
            alt="logo Samorządu Studenckiego Politechniki Wrocławskiej"
          />
        </a>
        <NextImage src={logoDS as string} alt="logo Działu Studenckiego" />
        <Stack direction={"row"} spacing={6}>
          <SocialButton
            label={"WebsiteDS"}
            href={"https://dzialstudencki.pwr.edu.pl/"}
          >
            <FaGlobeEurope />
          </SocialButton>
          <SocialButton
            label={"FacebookDS"}
            href={"https://www.facebook.com/DzialStudenckiPWr/"}
          >
            <FaFacebook />
          </SocialButton>

          <SocialButton
            label={"Github"}
            href={
              "https://github.com/informatyzacja/strona-organizacji-studenckich"
            }
          >
            <FaGithub />
          </SocialButton>
        </Stack>
      </Container>
    </Box>
  );
};
