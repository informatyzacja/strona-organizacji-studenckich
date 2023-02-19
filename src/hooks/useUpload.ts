import { uploadResponseSchema } from "@/server/api/file/schema";
import { useMutation } from "@tanstack/react-query";
import { route } from "nextjs-routes";

export const useUpload = () => {
  const {
    data,
    mutate: upload,
    mutateAsync: uploadAsync,
    isLoading,
    error,
  } = useMutation(async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(
      route({
        pathname: "/api/file/[name]",
        query: {
          name: file.name,
        },
      }),
      {
        method: "POST",
        body: formData,
      }
    );

    const data = (await response.json()) as unknown;
    return uploadResponseSchema.parseAsync(data);
  });

  return {
    data,
    upload,
    uploadAsync,
    isLoading,
    error,
  };
};
