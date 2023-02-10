import { ArrowUpIcon } from "@chakra-ui/icons";
import { Box, IconButton } from "@chakra-ui/react";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { AnimatePresenceSSR } from "./AnimatePresenceSSR";

export const ScrollToTop = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const handleScroll = () => {
    const position = window.pageYOffset;
    setScrollPosition(position);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <AnimatePresenceSSR>
      {scrollPosition > 500 ? (
        <Box position="fixed" bottom="20px" right={["16px", "84px"]} zIndex={1}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0, dur: 0.1 }}
            transition={{ type: "spring", duration: 0.4 }}
          >
            <IconButton
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              colorScheme="blue"
              aria-label="Wróć do góry"
              size="lg"
              icon={<ArrowUpIcon />}
            />
          </motion.div>
        </Box>
      ) : null}
    </AnimatePresenceSSR>
  );
};
