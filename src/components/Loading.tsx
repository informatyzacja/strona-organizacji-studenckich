import type { CenterProps } from "@chakra-ui/layout";
import { Center } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import React from "react";

export const Loading = (props: CenterProps) => {
  return (
    <Center {...props}>
      <Spinner />
    </Center>
  );
};
