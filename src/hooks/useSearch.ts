import type { RouterOutputs } from '@/utils/api';
import { useMemo, useState } from 'react'
import { useFuse } from './useFuse';
import { useSelectedTags } from './useSelectedTags';

type Organizations = RouterOutputs["organizations"]["getAll"];

export const useSearch = (data?: Organizations) => {
  const [search, setSearch] = useState("");
  const { selectedTags } = useSelectedTags();

  const fuseResult = useFuse(data ?? [], search, {
    keys: [{
      name: "name",
      weight: 2,
    }, {
      name: "description",
      weight: 1,
    }, {
      name: "tags",
      weight: 4,
    }],
    ignoreLocation: true,
    threshold: 0.3,
    includeMatches: true,
  });

  console.log("fuseResult", JSON.stringify(fuseResult));

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
      const { tags } = item;
      return selectedTags.every((tag) => tags.includes(tag));
    });
  }, [result, selectedTags]);



  return {
    search,
    setSearch,
    results: filteredByTag,
  }
}
