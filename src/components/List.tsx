import type { RouterOutputs } from "@/utils/api";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import type { BoxProps } from "@chakra-ui/react";
import { VStack, Wrap, WrapItem, Text, Box } from "@chakra-ui/react";
import { motion } from "framer-motion";
import React from "react";
import { AnimatePresenceSSR } from "./AnimatePresenceSSR";
import { Organisation } from "./Organisation";

export const List = ({
  data,
  ...styles
}: {
  data?: RouterOutputs["organizations"]["getAll"];
} & BoxProps) => {
  return (
    <Box {...styles}>
      <AnimatePresenceSSR>
        {data?.length === 0 ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.4 }}
          >
            <VStack>
              <InfoOutlineIcon mt={16} />
              <Text size="md">
                Brak organizacji, które spełniają twoje zapytanie
              </Text>
            </VStack>
          </motion.div>
        ) : null}
      </AnimatePresenceSSR>

      <VStack>
        {data && data?.length > 0 ? (
          <Text color="GrayText" ml={10} fontSize="sm" alignSelf="start">
            {data?.length} wyników
          </Text>
        ) : null}
        <Wrap
          w={{ base: "100%", md: "900px" }}
          spacing={4}
          mx="auto"
          justify="center"
        >
          <AnimatePresenceSSR mode="popLayout">
            {data?.slice(0, 10).map((org) => (
              <motion.div
                key={org.id}
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0, dur: 0.1 }}
                transition={{ type: "spring", duration: 0.4 }}
              >
                <WrapItem p={2}>
                  <Organisation {...org} />
                </WrapItem>
              </motion.div>
            ))}
          </AnimatePresenceSSR>
        </Wrap>
      </VStack>
    </Box>
  );
};
