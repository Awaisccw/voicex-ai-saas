import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@saas/db";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET ?? "saas-super-secret-key-development-mode-12345",
  pages: {
    signIn: "/login",
    newUser: "/register",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@company.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const normalizedEmail = credentials.email.toLowerCase().trim();

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user || !user.passwordHash) {
          throw new Error("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash,
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          credits: user.credits,
          tier: user.tier,
          stripeCustomerId: user.stripeCustomerId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.credits = user.credits;
        token.tier = user.tier;
        token.stripeCustomerId = user.stripeCustomerId;
      }

      // Handle session updates (e.g., after Stripe credit top-up)
      if (trigger === "update" && session) {
        if (typeof session.credits === "number") {
          token.credits = session.credits;
        }
        if (session.tier) {
          token.tier = session.tier;
        }
        if (session.stripeCustomerId !== undefined) {
          token.stripeCustomerId = session.stripeCustomerId;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name ?? null;
        session.user.credits = token.credits;
        session.user.tier = token.tier;
        session.user.stripeCustomerId = token.stripeCustomerId ?? null;
      }
      return session;
    },
  },
};
