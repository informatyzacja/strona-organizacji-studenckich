import { atomWithReset } from "jotai/utils";

export const numberOfOrganizationsToShowAtom = atomWithReset<number>(10);
