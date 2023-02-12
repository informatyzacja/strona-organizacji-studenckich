import React from "react";
import {
  Box,
  Flex,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
} from "@chakra-ui/react";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import pl from "date-fns/locale/pl";
import type { ReactNode } from "react";
import { BsCalendar, BsPerson } from "react-icons/bs";
import { AiOutlineProject } from "react-icons/ai";

const StatsCard = (props: { title: string; stat: string; icon: ReactNode }) => {
  const { title, stat, icon } = props;
  return (
    <Stat
      px={{ base: 2, md: 4 }}
      py={"5"}
      shadow={"md"}
      border={"1px solid"}
      borderColor={useColorModeValue("gray.800", "gray.500")}
      rounded={"lg"}
    >
      <Flex justifyContent={"space-between"}>
        <Box pl={{ base: 2, md: 4 }}>
          <StatLabel fontWeight={"medium"} isTruncated>
            {title}
          </StatLabel>
          <StatNumber fontSize={"xl"} fontWeight={"medium"}>
            {stat}
          </StatNumber>
        </Box>
        <Box
          my={"auto"}
          color={useColorModeValue("gray.800", "gray.200")}
          alignContent={"center"}
        >
          {icon}
        </Box>
      </Flex>
    </Stat>
  );
};

export const OrganisationStats = ({
  members,
  createdAt,
  numberOfProjects,
}: {
  members: number;
  createdAt: Date;
  numberOfProjects: number;
}) => {
  return (
    <Box maxW="7xl" mx={"auto"} pt={5} px={{ base: 2, sm: 12, md: 17 }}>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 5, lg: 8 }}>
        <StatsCard
          title={"Członkowie"}
          stat={members.toString()}
          icon={<BsPerson size={"3em"} />}
        />
        <StatsCard
          title={"Działamy przez"}
          stat={formatDistanceToNow(createdAt, { locale: pl })}
          icon={<BsCalendar size={"3em"} />}
        />
        <StatsCard
          title={"Projekty"}
          stat={numberOfProjects.toString()}
          icon={<AiOutlineProject size={"3em"} />}
        />
      </SimpleGrid>
    </Box>
  );
};
