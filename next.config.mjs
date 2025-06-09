// @ts-check
import withRoutes from "nextjs-routes/config";
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env.mjs"));

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  /**
   * If you have the "experimental: { appDir: true }" setting enabled, then you
   * must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["pl"],
    defaultLocale: "pl",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "loremflickr.com",
        port: "",
        pathname: "/150/**",
      },
      {
        protocol: "https",
        hostname: "directus.informatyzacja.duckdns.org",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

const enableRoutesTypes = withRoutes();

export default enableRoutesTypes(config);
