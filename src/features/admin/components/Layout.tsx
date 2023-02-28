import type { ReactNode } from "react";
import React from "react";
import { Box, useDisclosure } from "@chakra-ui/react";
import { FiHome, FiTrendingUp } from "react-icons/fi";
import { HiTag } from "react-icons/hi";
import { Navbar } from "./Navbar";
import type { LinkItem } from "./Sidebar";
import { Sidebar } from "./Sidebar";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";

const LinkItems: Array<LinkItem> = [
  { name: "Panel", icon: FiHome, route: { pathname: "/admin" } },
  {
    name: "Organizacje",
    icon: FiTrendingUp,
    route: { pathname: "/admin/organizacje" },
  },
  { name: "Tagi", icon: HiTag, route: { pathname: "/admin/tagi" } },
];

export const Layout = ({ children }: { children: ReactNode }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { status, data } = useSession({
    required: true,
    onUnauthenticated: () => {
      void signIn("google", { callbackUrl: window.location.href });
    },
  });
  const router = useRouter();

  if (status === "loading") {
    return null;
  }

  if (data.user.role !== "ADMIN" && data.user.role !== "OWNER") {
    void router.push("/");
    return null;
  }

  return (
    <Box minH="100vh" bg={"gray.100"}>
      <Sidebar links={LinkItems} isOpen={isOpen} onClose={onClose} />
      <Navbar onOpen={onOpen} />
      <Box ml={{ base: 0, md: 60 }} p="4">
        {children}
      </Box>
    </Box>
  );
};
