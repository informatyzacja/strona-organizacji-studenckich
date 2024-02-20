import type { RouterOutputs } from "@/utils/api";
import { useMemo } from "react";
import { useFuse } from "./useFuse";
import { useSelectedTags } from "./useSelectedTags";
import { parseAsString, useQueryState } from "nuqs";

type Organizations = RouterOutputs["organizations"]["list"];

export const useSearch = (data?: Organizations) => {
  const [search, setSearch] = useQueryState(
    "szukaj",
    parseAsString.withOptions({ clearOnDefault: true }).withDefault(""),
  );
  const { selectedTags } = useSelectedTags();

  const fuseResult = useFuse(data ?? [], search ?? "", {
    keys: [
      {
        name: "name",
        weight: 2,
      },
      {
        name: "shortDescription",
        weight: 1,
      },
      {
        name: "tags",
        weight: 3,
      },
    ],
    ignoreLocation: true,
    threshold: 0.3,
    includeMatches: true,
  });

  const isEmptySearch = search.length === 0;

  const result = useMemo(() => {
    if (isEmptySearch) {
      return data ?? [];
    }

    return fuseResult.map((item) => item.item);
  }, [data, isEmptySearch, fuseResult]);

  const filteredByTag = useMemo(() => {
    if (selectedTags.length === 0) {
      return result;
    }

    return result.filter((item) => {
      return selectedTags.every((tag) => item.tags.includes(tag));
    });
  }, [result, selectedTags]);

  return {
    search,
    setSearch,
    results: filteredByTag,
  };
};
