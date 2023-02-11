import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "@/utils/api";
import { theme } from "@/styles/theme";
import { ChakraProvider } from "@chakra-ui/react";
import { Layout } from "@/components/Layout";
import Head from "next/head";
import { AnimatePresenceSSR } from "@/components/AnimatePresenceSSR";
import { usePreserveScroll } from "@/hooks/usePreserveScroll";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
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
        <SessionProvider session={session}>
          <AnimatePresenceSSR mode="wait" initial={false}>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </AnimatePresenceSSR>
        </SessionProvider>
      </ChakraProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
