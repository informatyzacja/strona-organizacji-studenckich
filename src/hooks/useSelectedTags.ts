import { selectedTagsAtom } from "@/atoms/selectedTags";
import { useAtom } from "jotai";

export const useSelectedTags = () => {
  const [tags, setTags] = useAtom(selectedTagsAtom);

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  return { selectedTags: tags, toggleTag };
};
