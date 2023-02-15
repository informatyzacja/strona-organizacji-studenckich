import type { FlexProps } from "@chakra-ui/react";
import {
  Flex,
  IconButton,
  HStack,
  Menu,
  MenuButton,
  Avatar,
  VStack,
  MenuList,
  MenuItem,
  Text,
  MenuDivider,
  Box,
} from "@chakra-ui/react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import { FiMenu, FiBell, FiChevronDown } from "react-icons/fi";
import { Breadcrumb } from "./Breadcrumb";

export const Navbar = ({
  onOpen,
  ...rest
}: {
  onOpen: () => void;
} & FlexProps) => {
  const { data, status } = useSession({
    required: true,
  });
  const router = useRouter();

  if (status !== "authenticated") {
    return null;
  }

  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="20"
      position="sticky"
      top={0}
      alignItems="center"
      bg={"white"}
      borderBottomWidth="1px"
      zIndex="sticky"
      borderBottomColor={"gray.200"}
      justifyContent={{ base: "space-between", md: "flex-end" }}
      {...rest}
    >
      <IconButton
        display={{ base: "flex", md: "none" }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
      />

      <Text
        display={{ base: "flex", md: "none" }}
        fontSize="2xl"
        fontFamily="monospace"
        fontWeight="bold"
      >
        Logo
      </Text>
      {status === "authenticated" ? (
        <HStack w="100%" spacing={{ base: "0", md: "6" }}>
          <Breadcrumb mr="auto" />
          <IconButton
            size="lg"
            variant="ghost"
            aria-label="Otwórz menu użytkownika"
            icon={<FiBell />}
          />
          <Flex alignItems={"center"}>
            <Menu>
              <MenuButton
                py={2}
                transition="all 0.3s"
                _focus={{ boxShadow: "none" }}
              >
                <HStack>
                  <Avatar
                    size={"sm"}
                    name={data?.user.name ?? ""}
                    src={data?.user.image ?? ""}
                  />
                  <VStack
                    display={{ base: "none", md: "flex" }}
                    alignItems="flex-start"
                    spacing="1px"
                    ml="2"
                  >
                    <Text fontSize="sm">{data?.user.name}</Text>
                    <Text
                      fontSize="xs"
                      color="gray.600"
                      textTransform="capitalize"
                    >
                      {data?.user.role}
                    </Text>
                  </VStack>
                  <Box display={{ base: "none", md: "flex" }}>
                    <FiChevronDown />
                  </Box>
                </HStack>
              </MenuButton>
              <MenuList bg={"white"} borderColor={"gray.200"}>
                <MenuItem>Profil</MenuItem>
                <MenuDivider />
                <MenuItem
                  onClick={() => {
                    void signOut({ redirect: false }).then(() => {
                      void router.push("/");
                    });
                  }}
                >
                  Wyloguj się
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </HStack>
      ) : null}
    </Flex>
  );
};
