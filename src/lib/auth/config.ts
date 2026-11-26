import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import type { UserRole } from '@prisma/client';
import { prisma } from '@/lib/database/prisma';
import { isDatabaseConfigured, isGoogleAuthConfigured } from '@/config/env';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession['user'];
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const providers = [
  Credentials({
    name: 'Email and Password',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(rawCredentials) {
      if (!isDatabaseConfigured()) return null;
      const parsed = credentialsSchema.safeParse(rawCredentials);
      if (!parsed.success) return null;

      const email = parsed.data.email.trim().toLowerCase();
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.passwordHash || user.status !== 'ACTIVE') {
        return null;
      }

      const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
      if (!valid) return null;

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      };
    },
  }),
  ...(isGoogleAuthConfigured()
    ? [
        Google({
          clientId: process.env.AUTH_GOOGLE_ID!,
          clientSecret: process.env.AUTH_GOOGLE_SECRET!,
        }),
      ]
    : []),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: isDatabaseConfigured() ? PrismaAdapter(prisma) : undefined,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/error',
    verifyRequest: '/verify-request',
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = (user as { role?: UserRole }).role ?? 'USER';
      } else if (token.sub && isDatabaseConfigured()) {
        // Refresh role and status from DB so role changes/suspensions take effect
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true, status: true },
        });
        if (!dbUser || dbUser.status !== 'ACTIVE') {
          return { ...token, suspended: true };
        }
        token.role = dbUser.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = (token.role as UserRole) ?? 'USER';
      }
      return session;
    },
  },
});
