import type { GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
  type DefaultUser,
} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { env } from "../env.mjs";
import { prisma } from "./db";
import type { Role } from ".prisma/client";

const getUser = (id: string) =>
  prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      role: true,
      organization: {
        select: {
          id: true,
        },
      },
    },
  });

type PrismaUser = NonNullable<Awaited<ReturnType<typeof getUser>>>;
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: Role;
      organizationId?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser, PrismaUser {}
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
        session.user.organizationId = user.organization?.id;
      }
      return session;
    },
    redirect({ url, baseUrl }) {
      const isRelativeUrl = url.startsWith("/");
      const isTheSameOrigin = new URL(url).origin === baseUrl;

      if (isRelativeUrl) {
        return `${baseUrl}${url}`;
      } else if (isTheSameOrigin) {
        return url;
      }

      return baseUrl;
    },
  },
  adapter: {
    ...PrismaAdapter(prisma),
    getUser,
  },
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
};

export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
