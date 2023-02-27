import { useForm } from "@/hooks/useForm";
import { api } from "@/utils/api";
import {
  Button,
  Heading,
  Input,
  Link,
  useToast,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { z } from "zod";
import { FormField } from "../../components/FormField";
import { Layout } from "../../components/Layout";
import NextLink from "next/link";
import { route } from "nextjs-routes";

const schema = z.object({
  text: z
    .string()
    .min(1, "Tag nie może być pusty")
    .max(100, "Tag może mieć maksymalnie 100 znaków"),
});

export const CreateTagPage = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    schema,
    mode: "onTouched",
  });
  const toast = useToast({
    status: "success",
  });

  const { mutateAsync: addTag } = api.tags.create.useMutation();

  return (
    <Layout>
      <Link
        href={route({
          pathname: "/admin/tagi",
        })}
        color="gray"
        as={NextLink}
      >
        Wróć
      </Link>
      <Heading mt={2} mb={4}>
        Stwórz tag
      </Heading>
      <form
        onSubmit={handleSubmit(async (data) => {
          try {
            await addTag(data);
            toast({
              title: "Tag został dodany",
              description: `Tag ${data.text} został dodany`,
              duration: 5000,
              isClosable: true,
            });
            reset();
          } catch {
            toast({
              title: "Wystąpił błąd",
              description: `Nie udało się dodać tagu ${data.text}`,
              duration: 5000,
              isClosable: true,
            });
          }
        })}
      >
        <VStack spacing={8} maxW={{ base: "100%", md: "600px" }} align="start">
          <FormField label="Tag" error={errors.text?.message}>
            <Input
              placeholder="Tag"
              variant=""
              {...register("text")}
              type="text"
            />
          </FormField>
          <Button type="submit" colorScheme="blue" isLoading={isSubmitting}>
            Dodaj
          </Button>
        </VStack>
      </form>
    </Layout>
  );
};
