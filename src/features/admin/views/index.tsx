import { Loading } from "@/components/Loading";
import NotFound from "@/pages/404";
import type { RouterOutputs } from "@/utils/api";
import { api } from "@/utils/api";
import {
  TableContainer,
  Table,
  TableCaption,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Button,
  HStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { Layout } from "../components/Layout";
import type { SortingState } from "@tanstack/react-table";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/router";

const columnHelper =
  createColumnHelper<RouterOutputs["organizations"]["list"][number]>();

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

export const HomePage = () => {
  const { data, isLoading } = api.organizations.list.useQuery();

  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable<RouterOutputs["organizations"]["list"][number]>({
    data: data ?? [],
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
  });

  const router = useRouter<"/admin">();

  if (isLoading) {
    return <Loading />;
  }

  if (!data) {
    return <NotFound />;
  }

  return (
    <Layout>
      <HStack justify="flex-end">
        <Button
          variant="solid"
          colorScheme="blue"
          onClick={() => {
            void router.push("/admin/organizacje/stworz");
          }}
        >
          Stwórz nową
        </Button>
      </HStack>
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
    </Layout>
  );
};
