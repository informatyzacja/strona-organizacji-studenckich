import type { RouterOutputs } from "@/utils/api";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import type { BoxProps } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import { VStack, Wrap, WrapItem, Text, Box } from "@chakra-ui/react";
import { motion } from "framer-motion";
import React from "react";
import { AnimatePresenceSSR } from "@/components/AnimatePresenceSSR";
import { OrganisationCard } from "./OrganisationCard";
import { useNumberOfOrganizationsToShow } from "../hooks/useNumberOfOrganizationsToShow";
import { directusFileUrl } from "@/utils/directus";

export const List = ({
  data,
  ...styles
}: {
  data?: RouterOutputs["organizations"]["list"];
} & BoxProps) => {
  const { numberOfOrganizations, loadMore } = useNumberOfOrganizationsToShow();

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
            {data?.slice(0, numberOfOrganizations).map((org) => (
              <motion.div
                key={org.name}
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0, dur: 0.1 }}
                transition={{ type: "spring", duration: 0.4 }}
              >
                <WrapItem p={2}>
                  <OrganisationCard
                    name={org.name}
                    description={org.shortDescription}
                    logoUrl={directusFileUrl(org.logo)}
                    slug={org.slug}
                    tags={org.tags}
                  />
                </WrapItem>
              </motion.div>
            ))}
          </AnimatePresenceSSR>
        </Wrap>
        {data && data?.length > numberOfOrganizations ? (
          <Box>
            <Button mt={8} mb={8} onClick={() => loadMore()}>
              Pokaż więcej
            </Button>
          </Box>
        ) : null}
      </VStack>
    </Box>
  );
};
