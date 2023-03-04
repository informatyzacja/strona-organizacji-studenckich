import type { BoxProps } from "@chakra-ui/react";
import {
  useColorModeValue,
  Text,
  Box,
  Flex,
  CloseButton,
  Drawer,
  DrawerContent,
} from "@chakra-ui/react";
import type { Route } from "nextjs-routes";
import { route } from "nextjs-routes";
import React from "react";
import type { IconType } from "react-icons";
import { NavItem } from "./NavItem";

export interface LinkItem {
  name: string;
  icon: IconType;
  route: Route;
}

export const Sidebar = ({
  onClose,
  isOpen,
  links,
}: {
  onClose: () => void;
  isOpen: boolean;
  links: LinkItem[];
}) => {
  return (
    <>
      <SidebarContent
        onClose={onClose}
        links={links}
        display={{ base: "none", md: "block" }}
      />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} links={links} />
        </DrawerContent>
      </Drawer>
    </>
  );
};

export const SidebarContent = ({
  onClose,
  links,
  ...styles
}: { onClose: () => void; links: LinkItem[] } & BoxProps) => {
  return (
    <Box
      transition="3s ease"
      bg={useColorModeValue("white", "gray.900")}
      borderRight="1px"
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
      w={{ base: "full", md: 60 }}
      pos="fixed"
      h="full"
      {...styles}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
          Logo
        </Text>
        <CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
      </Flex>
      {links.map((link) => (
        <NavItem key={link.name} icon={link.icon} href={route(link.route)}>
          {link.name}
        </NavItem>
      ))}
    </Box>
  );
};
