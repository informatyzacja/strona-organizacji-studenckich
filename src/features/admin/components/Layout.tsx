import type { ReactNode } from "react";
import React from "react";
import { Box, useColorModeValue, useDisclosure } from "@chakra-ui/react";
import { FiHome, FiTrendingUp, FiCompass, FiSettings } from "react-icons/fi";
import { Navbar } from "./Navbar";
import type { LinkItem } from "./Sidebar";
import { Sidebar } from "./Sidebar";

const LinkItems: Array<LinkItem> = [
  { name: "Panel", icon: FiHome },
  { name: "Organizacje", icon: FiTrendingUp },
  { name: "Użytkownicy", icon: FiCompass },
  { name: "Ustawienia", icon: FiSettings },
];

export const Layout = ({ children }: { children: ReactNode }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Box minH="100vh" bg={useColorModeValue("gray.100", "gray.900")}>
      <Sidebar links={LinkItems} isOpen={isOpen} onClose={onClose} />
      <Navbar onOpen={onOpen} />
      <Box ml={{ base: 0, md: 60 }} p="4">
        {children}
      </Box>
    </Box>
  );
};
