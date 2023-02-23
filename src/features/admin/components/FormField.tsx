import type { FormControlProps } from "@chakra-ui/react";
import { FormControl, FormLabel, FormErrorMessage } from "@chakra-ui/react";
import React from "react";

export const FormField = ({
  label,
  children,
  error,
  ...formControlProps
}: {
  label: string;
  children: React.ReactNode;
  error?: string | boolean;
} & FormControlProps) => {
  return (
    <FormControl isInvalid={error ? true : false} {...formControlProps}>
      <FormLabel>{label}</FormLabel>
      {children}
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
};
