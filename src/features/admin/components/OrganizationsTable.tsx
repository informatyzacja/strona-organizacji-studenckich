import type { RouterOutputs } from "@/utils/api";
import {
  TableContainer,
  Table,
  TableCaption,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from "@chakra-ui/react";
import type { SortingState } from "@tanstack/react-table";
import {
  useReactTable,
  getSortedRowModel,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import { useRouter } from "next/router";
import React, { useState } from "react";

type Organization = RouterOutputs["organizations"]["list"][number];

const columnHelper = createColumnHelper<Organization>();

const columns = [
  columnHelper.accessor("name", {
    header: () => "Nazwa",
  }),
  columnHelper.accessor("description", {
    cell: (info) => info.getValue().slice(0, 40) + "...",
    header: () => "Krótki opis",
  }),
  columnHelper.accessor("Tags", {
    header: () => "Tagi",
    cell: (info) => info.getValue().join(", "),
  }),
];

export const OrganizationsTable = ({ data }: { data: Organization[] }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const router = useRouter();

  const table = useReactTable<Organization>({
    data: data ?? [],
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <TableContainer>
      <Table variant="simple" colorScheme="blackAlpha">
        <TableCaption>Wszystkie organizacje</TableCaption>
        <Thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Th
                  key={header.id}
                  cursor="pointer"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  {{
                    asc: "↑",
                    desc: "↓",
                  }[header.column.getIsSorted() as string] ?? null}
                </Th>
              ))}
            </Tr>
          ))}
        </Thead>
        <Tbody>
          {table.getRowModel().rows.map((row) => (
            <Tr
              key={row.id}
              transition="0.2s"
              _hover={{
                background: "gray.300",
              }}
              cursor="pointer"
              onClick={() => {
                if (!row.original) {
                  return;
                }
                void router.push({
                  pathname: "/admin/organizacje/[slug]",
                  query: {
                    slug: row.original.slug,
                  },
                });
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <Td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};
