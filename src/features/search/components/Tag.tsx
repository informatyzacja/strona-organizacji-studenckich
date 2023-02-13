import { useSelectedTags } from "../hooks/useSelectedTags";
import type { TagProps } from "@chakra-ui/react";
import { Tag as ChakraTag } from "@chakra-ui/react";
import React from "react";

export const Tag = ({ tag, ...styles }: { tag: string } & TagProps) => {
  const { selectedTags } = useSelectedTags();

  const isSelected = selectedTags.includes(tag);

  return (
    <ChakraTag
      px={2}
      py={1}
      colorScheme={isSelected ? "blue" : "blackAlpha"}
      fontWeight={"400"}
      {...styles}
    >
      {tag}
    </ChakraTag>
  );
};
