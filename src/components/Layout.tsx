import { chakra, Stack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import React from "react";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <Stack minH="100vh" justify="space-between">
      <div>
        <Navbar />
        <chakra.main>{children}</chakra.main>
      </div>
      <Footer />
    </Stack>
  );
};
