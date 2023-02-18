import { AnimatePresenceSSR } from "@/components/AnimatePresenceSSR";
import { useForm } from "@/hooks/useForm";
import { useUpload } from "@/hooks/useUpload";
import { acceptedImageTypes, maxFileSize } from "@/server/api/file/schema";
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Switch,
  Textarea,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import React, { useState } from "react";
import { z } from "zod";
import { Layout } from "../components/Layout";

const departments = [
  "W1",
  "W2",
  "W3",
  "W4",
  "W5",
  "W6",
  "W7",
  "W8",
  "W9",
  "W10",
  "W11",
  "W12",
] as const;

const schema = z.object({
  email: z.string().email(),
  addManualy: z.boolean().default(false),
  name: z.string().default(""),
  residence: z.enum(departments).default("W1"),
  foundationDate: z.date().default(new Date()),
  description: z.string().default(""),
  long_description: z.string().optional().default(""),
  number_of_users: z.number().optional().default(0),
  logo: z
    .instanceof(typeof FileList !== "undefined" ? FileList : Array)
    .superRefine((value, ctx) => {
      if (value instanceof FileList && value[0]) {
        if (value[0].size > maxFileSize) {
          ctx.addIssue({
            code: "custom",
            message: `Zbyt duży rozmiar pliku. Maksymalny rozmiar to ${Math.round(
              maxFileSize / 1024 / 1024
            )} MB`,
          });
        }
      }
    }),
});

export const CreatePage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    schema,
  });
  const toast = useToast({
    status: "success",
  });
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const { uploadAsync } = useUpload();
  return (
    <Layout>
      <Heading mb={4}>Stwórz organizacje</Heading>
      <form
        onSubmit={handleSubmit(async (data) => {
          if (data.logo instanceof FileList && data.logo[0]) {
            try {
              await uploadAsync(data.logo[0]);
              toast({
                title: "Organizacja została dodana",
              });
            } catch {
              toast({
                status: "error",
                title: "Błąd podczas dodawania organizacji",
                description: `Nie udało się dodać organizacji`,
              });
            }
          }
        })}
      >
        <VStack spacing={0} maxW={{ base: "100%", md: "600px" }} align="start">
          <FormControl isRequired isInvalid={errors.email !== undefined} mb={4}>
            <FormLabel>Email organizacji</FormLabel>
            <Input
              {...register("email")}
              variant=""
              placeholder="Email organizacji"
            />
            <FormErrorMessage>
              {errors.email?.message && "Niepoprawny email"}
            </FormErrorMessage>
          </FormControl>
          <FormControl display="flex" alignItems="center" pb={4}>
            <FormLabel htmlFor="additional-info" mb="0">
              Czy chcesz sam(a) uzupełniać dane?
            </FormLabel>
            <Switch
              {...register("addManualy")}
              id="additional-info"
              checked={showAdditionalInfo}
              onChange={(e) => {
                setShowAdditionalInfo(e.target.checked);
              }}
            />
          </FormControl>
          <AnimatePresenceSSR mode="wait">
            {showAdditionalInfo ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{
                  type: "spring",
                  duration: 1,
                }}
                style={{
                  width: "100%",
                }}
              >
                <VStack align="start" mt={2} mb={6} w="100%">
                  <FormControl isRequired isInvalid={errors.name !== undefined}>
                    <FormLabel>Nazwa organizacji</FormLabel>
                    <Input
                      {...register("name")}
                      variant=""
                      placeholder="Nazwa organizacji"
                    />
                    <FormErrorMessage>
                      {errors.name?.message &&
                        "Nieprawidłowa nazwa organizacji"}{" "}
                      123
                    </FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={errors.logo !== undefined}>
                    <FormLabel>Logo</FormLabel>
                    <Input
                      {...register("logo")}
                      type="file"
                      accept={acceptedImageTypes.join(", ")}
                      backgroundColor="white"
                      sx={{
                        "::file-selector-button": {
                          height: 10,
                          padding: 0,
                          mr: 4,
                          background: "none",
                          border: "none",
                          fontWeight: "bold",
                        },
                      }}
                    />
                    <FormErrorMessage>{errors.logo?.message}</FormErrorMessage>
                  </FormControl>
                  <FormControl
                    isRequired
                    isInvalid={errors.residence !== undefined}
                  >
                    <FormLabel>Wydział</FormLabel>
                    <Select {...register("residence")} variant="">
                      {departments.map((department) => (
                        <option key={department} value={department}>
                          {department}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>
                      {errors.residence?.message && "Nieprawidłowy wydział"}
                    </FormErrorMessage>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Krótki opis</FormLabel>
                    <Textarea
                      {...register("description")}
                      variant=""
                      placeholder="Opis"
                    />
                    <FormErrorMessage>
                      {errors.description?.message && "Nieprawidłowy opis"}
                    </FormErrorMessage>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Długi opis</FormLabel>
                    <Textarea
                      {...register("long_description")}
                      variant=""
                      placeholder="Opis"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Liczba członków</FormLabel>
                    <NumberInput variant="">
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormErrorMessage>
                      {errors.number_of_users?.message &&
                        "Nieprawidłowa ilość członków"}
                    </FormErrorMessage>
                  </FormControl>
                </VStack>
              </motion.div>
            ) : null}
          </AnimatePresenceSSR>
          <Button
            mt={6}
            type="submit"
            colorScheme="blue"
            isLoading={isSubmitting}
          >
            Dodaj
          </Button>
        </VStack>
      </form>
    </Layout>
  );
};
