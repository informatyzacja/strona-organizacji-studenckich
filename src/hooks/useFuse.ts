import Fuse from "fuse.js"
import { useMemo } from "react"

export const useFuse = <T>(
  list: T[],
  searchTerm: string,
  fuseOptions?: Fuse.IFuseOptions<T>
) => {
  const fuse = useMemo(() => {
      return new Fuse(list, fuseOptions)
  }, [list, fuseOptions])

  const results = useMemo(() => {
      return fuse.search(searchTerm)
  }, [fuse, searchTerm])

  return results
}