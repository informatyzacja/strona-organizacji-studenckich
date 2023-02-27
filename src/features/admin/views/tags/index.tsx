import { Tag } from "@/features/search";
import type { RouterOutputs } from "@/utils/api";
import { api } from "@/utils/api";
import { DeleteIcon } from "@chakra-ui/icons";
import {
  HStack,
  Button,
  TableContainer,
  Table,
  TableCaption,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  useDisclosure,
  useToast,
  IconButton,
} from "@chakra-ui/react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/router";
import React from "react";
import { DeleteModal } from "../../components/DeleteModal";
import { Layout } from "../../components/Layout";

type Tag = RouterOutputs["tags"]["listAdmin"][number];

const columnHelper = createColumnHelper<Tag>();

const RowActions = ({ id, text }: { id: string; text: string }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { onOpen, onClose, isOpen } = useDisclosure();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const toast = useToast();
  const utils = api.useContext();
  const { mutate, isLoading } = api.tags.delete.useMutation({
    onSuccess: async () => {
      onClose();
      await utils.tags.listAdmin.invalidate();
      toast({
        title: "Tag usunięty",
        description: `Tag ${text} został usunięty.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    onError: () => {
      toast({
        title: "Nie udało się usunąć tagu",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  return (
    <>
      <IconButton
        aria-label={`Usuń tag ${text}`}
        icon={<DeleteIcon />}
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
      />
      <DeleteModal
        onClose={onClose}
        isOpen={isOpen}
        isLoading={isLoading}
        title="Usuń tag"
        onDelete={() => {
          mutate({
            id,
          });
        }}
      >
        Czy na pewno chcesz usunąć tag <Tag ml={1} tag={text} />?
      </DeleteModal>
    </>
  );
};

const columns = [
  columnHelper.accessor("text", {
    header: () => "Tag",
    cell: (info) => <Tag tag={info.getValue()} />,
  }),
  columnHelper.accessor("_count.organizations", {
    id: "organizationsCount",
    header: () => "Ilość organizacji",
  }),
  columnHelper.display({
    id: "actions",
    header: () => "Akcje",
    cell: ({ row }) => (
      <RowActions id={row.original.id} text={row.original.text} />
    ),
  }),
];

export const TagsPage = () => {
  const tags = api.tags.listAdmin.useQuery();
  const router = useRouter();

  const table = useReactTable<Tag>({
    data: tags.data ?? [],
    columns,
    initialState: {
      columnSizing: {
        organizationsCount: 10000,
      },
      sorting: [
        {
          id: "organizationsCount",
          desc: true,
        },
      ],
    },
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Layout>
      <HStack justify="flex-end">
        <Button
          variant="solid"
          colorScheme="blue"
          onClick={() => {
            void router.push({
              pathname: "/admin/tagi/stworz",
            });
          }}
        >
          Stwórz nowy
        </Button>
      </HStack>
      <TableContainer>
        <Table variant="simple" colorScheme="blackAlpha">
          <TableCaption>Wszystkie tagi</TableCaption>
          <Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Th key={header.id} width={`${header.getSize()}rem`}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
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
                  void router.push({
                    pathname: "/admin/tagi/[text]",
                    query: {
                      text: row.original.text,
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
