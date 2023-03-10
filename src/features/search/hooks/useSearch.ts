import type { RouterOutputs } from "@/utils/api";
import { useMemo, useState } from "react";
import { useFuse } from "./useFuse";
import { useSelectedTags } from "./useSelectedTags";

type Organizations = RouterOutputs["organizations"]["list"];

export const useSearch = (data?: Organizations) => {
  const [search, setSearch] = useState("");
  const { selectedTags } = useSelectedTags();

  const fuseResult = useFuse(data ?? [], search, {
    keys: [
      {
        name: "name",
        weight: 3,
      },
      {
        name: "description",
        weight: 1,
      },
      {
        name: "tags",
        weight: 4,
      },
      {
        name: "department",
        weight: 2,
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
      const { Tags } = item;
      return selectedTags.every((tag) => Tags.includes(tag));
    });
  }, [result, selectedTags]);

  return {
    search,
    setSearch,
    results: filteredByTag,
  };
};
