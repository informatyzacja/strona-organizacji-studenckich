import { type AppType } from "next/app";

import { theme } from "@/styles/theme";
import { ChakraProvider } from "@chakra-ui/react";
import Head from "next/head";
import { AnimatePresenceSSR } from "@/components/AnimatePresenceSSR";
import { usePreserveScroll } from "@/hooks/usePreserveScroll";
import { DefaultSeo } from "next-seo";
import { siteConfig } from "@/config";
import { NuqsAdapter } from "nuqs/adapters/next/pages";

const MyApp: AppType = ({ Component, pageProps: { ...pageProps } }) => {
  usePreserveScroll();

  return (
    <>
      <DefaultSeo {...siteConfig} />
      <Head>
        <title>Aktywni na PWr</title>
        <meta
          name="description"
          content="Strona do wyszukiwania organizacji studenckich w obrębie Politechniki Wrocławskiej"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NuqsAdapter>
        <ChakraProvider theme={theme}>
          <AnimatePresenceSSR mode="wait" initial={false}>
            <Component {...pageProps} />
          </AnimatePresenceSSR>
        </ChakraProvider>
      </NuqsAdapter>
    </>
  );
};

export default MyApp;
