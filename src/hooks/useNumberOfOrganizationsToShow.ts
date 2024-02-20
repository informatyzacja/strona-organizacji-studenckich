import { useAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import { numberOfOrganizationsToShowAtom } from "../atoms/numberOfOrganizationsToShow";

export const useNumberOfOrganizationsToShow = () => {
  const [numberOfOrganizations, setNumberOfOrganizations] = useAtom(
    numberOfOrganizationsToShowAtom,
  );
  const reset = useResetAtom(numberOfOrganizationsToShowAtom);

  const loadMore = () => {
    setNumberOfOrganizations((prev) => prev + 30);
  };

  return { numberOfOrganizations, setNumberOfOrganizations, reset, loadMore };
};
