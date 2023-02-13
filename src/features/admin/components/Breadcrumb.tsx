import type { BreadcrumbProps } from "@chakra-ui/react";
import {
  Breadcrumb as ChakraBreadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";
import NextLink from "next/link";
import { useIsClient } from "@/hooks/useIsClient";

export const Breadcrumb = (props: BreadcrumbProps) => {
  const router = useRouter();
  const isClient = useIsClient();

  const generateBreadCrumb = () => {
    const asPathWithoutQuery = router.asPath.split("?")[0];

    const asPathNestedRoutes = asPathWithoutQuery
      ?.split("/")
      .filter((v) => v.length > 0);

    const crumblist =
      asPathNestedRoutes?.map((subpath, idx) => {
        const href = "/" + asPathNestedRoutes?.slice(0, idx + 1).join("/");
        const title = subpath;
        return { href, title };
      }) ?? [];

    return crumblist;
  };

  const breadCrumbItems = generateBreadCrumb();
  if (!isClient) return <ChakraBreadcrumb {...props} />;

  return (
    <ChakraBreadcrumb {...props}>
      {breadCrumbItems.map(({ title, href }, index) => (
        <BreadcrumbItem
          key={index}
          isCurrentPage={index === breadCrumbItems.length - 1}
        >
          <NextLink href={href as "/"}>
            <BreadcrumbLink textTransform="capitalize">{title}</BreadcrumbLink>
          </NextLink>
        </BreadcrumbItem>
      ))}
    </ChakraBreadcrumb>
  );
};
