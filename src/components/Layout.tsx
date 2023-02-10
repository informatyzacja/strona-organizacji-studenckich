import { chakra, Stack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import React from "react";
import { Lato } from "@next/font/google";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-lato",
  display: "swap",
});

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <Stack minH="100vh" justify="space-between" className={`${lato.variable}`}>
      <div>
        <Navbar />
        <chakra.main>{children}</chakra.main>
      </div>
      <Footer />
    </Stack>
  );
};
