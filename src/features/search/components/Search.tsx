import { useDebounce } from "@/hooks/useDebounce";
import { useSelectedTags } from "../hooks/useSelectedTags";
import { SearchIcon } from "@chakra-ui/icons";
import type { StackProps } from "@chakra-ui/react";
import { Wrap, WrapItem } from "@chakra-ui/react";
import { Input, InputGroup, InputRightElement, VStack } from "@chakra-ui/react";
import type { ComponentProps } from "react";
import React, { useEffect, useState } from "react";
import { Tag } from "./Tag";
import { api } from "@/utils/api";
import { useNumberOfOrganizationsToShow } from "../hooks/useNumberOfOrganizationsToShow";

const SelectableTag = (
  props: ComponentProps<typeof Tag> & {
    onToggle: (tag: string) => void;
  },
) => {
  return (
    <Tag
      cursor="pointer"
      userSelect="none"
      onClick={() => {
        props.onToggle(props.tag);
      }}
      {...props}
    />
  );
};

export const Search = ({
  value,
  setValue,
  ...styles
}: {
  value: string;
  setValue: (value: string) => void;
} & StackProps) => {
  const [search, setSearch] = useState(value);
  const debouncedSearch = useDebounce(search, 200);
  const { toggleTag } = useSelectedTags();
  const { reset } = useNumberOfOrganizationsToShow();
  const { data: tags } = api.tags.list.useQuery();

  useEffect(() => {
    setValue(debouncedSearch);
    reset();
  }, [debouncedSearch, reset, setValue]);

  return (
    <VStack {...styles}>
      <InputGroup display="block" w={{ base: "100%", md: "830px" }}>
        <Input
          px={3}
          variant="flushed"
          placeholder="Wyszukaj organizacje"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />
        <InputRightElement>
          <SearchIcon />
        </InputRightElement>
      </InputGroup>
      <Wrap w="100%" alignItems="start" pt={2}>
        {tags?.map((tag) => (
          <WrapItem key={tag}>
            <SelectableTag
              tag={tag}
              onToggle={() => {
                toggleTag(tag);
              }}
            />
          </WrapItem>
        ))}
      </Wrap>
    </VStack>
  );
};
