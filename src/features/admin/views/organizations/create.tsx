import { AnimatePresenceSSR } from "@/components/AnimatePresenceSSR";
import { useForm } from "@/hooks/useForm";
import { useUpload } from "@/hooks/useUpload";
import { acceptedImageTypes, maxFileSize } from "@/server/api/file/schema";
import { api, standaloneApiClient } from "@/utils/api";
import {
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Select,
  Switch,
  Textarea,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { route } from "nextjs-routes";
import React from "react";
import slugify from "slugify";
import { z } from "zod";
import { FormField } from "../../components/FormField";
import { Layout } from "../../components/Layout";
import NextLink from "next/link";

const departments = [
  "W1 - Wydział Architektury",
  "W2 - Wydział Budownictwa Lądowego i Wodnego",
  "W3 - Wydział Chemiczny",
  "W4 - Wydział Informatyki i Telekomunikacji",
  "W5 - Wydział Elektryczny",
  "W6 - Wydział Geoinżynierii, Górnictwa i Geologii",
  "W7 - Wydział Inżynierii Środowiska",
  "W8 - Wydział Zarządzania",
  "W9 - Wydział Mechaniczno-Energetyczny",
  "W10 - Wydział Mechaniczny",
  "W11 - Wydział Podstawowych Problemów Techniki",
  "W12 - Wydział Elektroniki, Fotoniki i Mikrosystemów",
  "W13 - Wydział Matematyki",
  "FLG - Filia W Legnicy",
  "FJG - Filia W Jeleniej Górze",
  "FWB - Filia w Wałbrzychu",
] as const;

const organisationTypes = [
  "Agenda Kultury",
  "Koło Naukowe",
  "Media Studenckie",
  "Organizacja Studencka",
  "Strategiczne Koło Naukowe",
  "Samorząd Studencki",
] as const;

const addManuallySchema = z.object({
  email: z
    .string()
    .email("Niepoprawny email")
    .refine(
      async (value) =>
        !(await standaloneApiClient.users.doesExist.query({ email: value })),
      {
        message: "Użytkownik o podanym emailu już istnieje",
      }
    ),
  addManually: z.literal(true),
  name: z.string().min(1, "Za krótka nazwa").max(100, "Za długa nazwa"),
  type: z.enum(organisationTypes),
  department: z.enum(departments).optional(),
  description: z.string().min(1, "Za krótki opis").max(200, "Za długi opis"),
  longDescription: z.string().max(6000, "Za długi opis").optional(),
  fieldOfStudy: z.string(),
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
    })
    .optional(),
});

const schema = z.discriminatedUnion("addManually", [
  z
    .object({
      addManually: z.literal(false),
    })
    .merge(
      addManuallySchema.pick({
        email: true,
      })
    ),
  addManuallySchema,
]);

export const CreateOrganizationPage = () => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    schema,
    mode: "onTouched",
  });
  const toast = useToast({
    status: "success",
  });
  const { uploadAsync } = useUpload();
  const addOrganization = api.organizations.create.useMutation();
  const addOrganizationByEmail = api.organizations.createByEmail.useMutation();

  const addManually = watch("addManually");

  return (
    <Layout>
      <Link
        href={route({
          pathname: "/admin/organizacje",
        })}
        color="gray"
        as={NextLink}
      >
        Wróć
      </Link>
      <Heading mt={2} mb={4}>
        Stwórz organizacje
      </Heading>
      <form
        onSubmit={handleSubmit(async (data) => {
          if (!data.addManually) {
            try {
              await addOrganizationByEmail.mutateAsync({
                email: data.email,
              });

              toast({
                status: "success",
                title: "Dodano użytkownika",
                description: `Użytkownik ${data.email} został dodany`,
              });
              reset();
            } catch (e) {
              console.error(e);

              toast({
                status: "error",
                title: "Błąd podczas dodawania użytkownika",
                description: `Nie udało się dodać użytkownika (więcej informacji w konsoli)`,
              });
            }

            return;
          }

          let logoUrl: string | undefined;

          if (data.logo instanceof FileList && data.logo[0]) {
            try {
              const { url } = await uploadAsync(data.logo[0]);
              logoUrl = url;
            } catch (e) {
              console.error(e);

              toast({
                status: "error",
                title: "Błąd podczas dodawania organizacji",
                description: `Nie udało się dodać organizacji (więcej informacji w konsoli)`,
              });

              return;
            }
          }

          if (data.addManually) {
            try {
              await addOrganization.mutateAsync({
                name: data.name,
                email: data.email,
                type: data.type,
                department: data.department,
                slug: slugify(data.name),
                description: data.description,
                longDescription: data.longDescription,
                fieldOfStudy: data.fieldOfStudy,
                logoUrl,
              });

              toast({
                status: "success",
                title: "Dodano organizację",
                description: `Organizacja ${data.name} została dodana`,
              });

              reset();
            } catch (e) {
              console.error(e);

              toast({
                status: "error",
                title: "Błąd podczas dodawania organizacji",
                description: `Nie udało się dodać organizacji (więcej informacji w konsoli)`,
              });
            }
          }
        })}
      >
        <VStack spacing={0} maxW={{ base: "100%", md: "600px" }} align="start">
          <FormField
            label="Email organizacji"
            isRequired
            error={errors.email?.message}
            mb={4}
          >
            <Input
              {...register("email")}
              variant=""
              placeholder="Email organizacji"
            />
          </FormField>
          <FormControl display="flex" alignItems="center" pb={4}>
            <FormLabel htmlFor="additional-info" mb="0">
              Czy chcesz sam(a) uzupełniać dane?
            </FormLabel>
            <Switch {...register("addManually")} id="additional-info" />
          </FormControl>
          <AnimatePresenceSSR mode="wait">
            {addManually ? (
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
                  <FormField
                    isRequired
                    label="Nazwa organizacji"
                    error={"name" in errors && errors.name?.message}
                  >
                    <Input
                      {...register("name")}
                      variant=""
                      placeholder="Nazwa organizacji"
                    />
                  </FormField>
                  <FormField
                    label="Logo"
                    error={"logo" in errors && errors.logo?.message}
                  >
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
                  </FormField>
                  <FormField
                    isRequired
                    label="Typ"
                    error={"type" in errors && errors.type?.message}
                  >
                    <Select {...register("type")} variant="">
                      {organisationTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                  <AnimatePresenceSSR mode="wait">
                    {watch("type") === "Koło Naukowe" ? (
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
                        <FormField label="Wydział/Filia">
                          <Select {...register("department")} variant="">
                            {departments.map((department) => (
                              <option key={department} value={department}>
                                {department}
                              </option>
                            ))}
                          </Select>
                        </FormField>
                      </motion.div>
                    ) : null}
                  </AnimatePresenceSSR>
                  <FormField
                    isRequired
                    label="Krótki opis (do 200 znaków)"
                    error={
                      "description" in errors && errors.description?.message
                    }
                  >
                    <Textarea
                      {...register("description")}
                      variant=""
                      placeholder="Opis"
                    />
                  </FormField>
                  <FormField label="Długi opis">
                    <Textarea
                      {...register("longDescription")}
                      variant=""
                      placeholder="Opis"
                    />
                  </FormField>
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
