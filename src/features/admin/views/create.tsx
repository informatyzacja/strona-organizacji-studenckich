import { AnimatePresenceSSR } from "@/components/AnimatePresenceSSR";
import { useForm } from "@/hooks/useForm";
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

  return (
    <Layout>
      <Heading mb={4}>Stwórz organizacje</Heading>
      <form
        onSubmit={handleSubmit(() => {
          toast({
            title: "Organizacja została dodana",
          });
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
                  <FormControl isRequired>
                    <FormLabel>Nazwa organizacji</FormLabel>
                    <Input
                      {...register("name")}
                      variant=""
                      placeholder="Nazwa organizacji"
                    />
                    <FormErrorMessage>
                      {errors.name?.message &&
                        "Nieprawidłowa nazwa organizacji"}
                    </FormErrorMessage>
                  </FormControl>
                  <FormControl isRequired>
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
