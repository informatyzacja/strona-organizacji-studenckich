import { chakra, Stack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import React from "react";
import { Lato } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { ScrollToTop } from "@/components/ScrollToTop";

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-lato",
  display: "swap",
});

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div>
      <Stack
        minH="100vh"
        as={motion.div}
        style={{ overflow: "scroll" }}
        justify="space-between"
        className={`${lato.variable}`}
      >
        <div>
          <Navbar />
          <chakra.main>{children}</chakra.main>
          <ScrollToTop />
        </div>
        <Footer />
      </Stack>
    </motion.div>
  );
};
