import { type AppType } from "next/app";

import { api } from "@/utils/api";
import { theme } from "@/styles/theme";
import { ChakraProvider } from "@chakra-ui/react";
import Head from "next/head";
import { AnimatePresenceSSR } from "@/components/AnimatePresenceSSR";
import { usePreserveScroll } from "@/hooks/usePreserveScroll";

const MyApp: AppType = ({ Component, pageProps: { ...pageProps } }) => {
  usePreserveScroll();

  return (
    <>
      <Head>
        <title>SOS</title>
        <meta
          name="description"
          content="Strona do wyszukiwania organizacji studenckich w obrębie Politechniki Wrocławskiej"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ChakraProvider theme={theme}>
        <AnimatePresenceSSR mode="wait" initial={false}>
          <Component {...pageProps} />
        </AnimatePresenceSSR>
      </ChakraProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
