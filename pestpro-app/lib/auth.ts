/**
 * NextAuth configuration with RBAC support
 * Provides authentication and role-based access control
 */

import { NextAuthOptions, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./db.js";
import crypto from "crypto";

// Define user roles
export enum UserRole {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  EDITOR = "editor",
  VIEWER = "viewer"
}

// Define permissions for each role
export const ROLE_PERMISSIONS = {
  [UserRole.SUPER_ADMIN]: [
    "users:read",
    "users:write",
    "users:delete",
    "destinations:read",
    "destinations:write",
    "destinations:delete",
    "events:read",
    "events:write",
    "conversions:read",
    "conversions:write",
    "markets:read",
    "markets:write",
    "articles:read",
    "articles:write",
    "articles:publish",
    "media:read",
    "media:write",
    "settings:read",
    "settings:write"
  ],
  [UserRole.ADMIN]: [
    "destinations:read",
    "destinations:write",
    "events:read",
    "conversions:read",
    "markets:read",
    "markets:write",
    "articles:read",
    "articles:write",
    "articles:publish",
    "media:read",
    "media:write"
  ],
  [UserRole.EDITOR]: [
    "events:read",
    "conversions:read",
    "articles:read",
    "articles:write",
    "media:read",
    "media:write"
  ],
  [UserRole.VIEWER]: ["events:read", "conversions:read", "articles:read", "media:read"]
} as const;

/**
 * Hash password using SHA-256 with salt
 */
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const passwordSalt = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, passwordSalt, 10000, 64, "sha256")
    .toString("hex");

  return { hash, salt: passwordSalt };
}

/**
 * Verify password against hash
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const { hash: computedHash } = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(computedHash));
}

/**
 * Check if user has permission
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(role: UserRole, permissions: string[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}

/**
 * NextAuth configuration
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Find user in database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.isActive) {
          return null;
        }

        // Verify password
        const isValid = verifyPassword(
          credentials.password,
          user.passwordHash,
          user.passwordSalt
        );

        if (!isValid) {
          return null;
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as UserRole
        };
      }
    })
  ],

  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }): Promise<Session> {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    }
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error"
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET
};

/**
 * Middleware helper to require authentication
 */
export async function requireAuth(req: Request): Promise<Session | null> {
  // In a real implementation, you'd extract the session from the request
  // This is a simplified version - use getServerSession in actual routes
  return null;
}

/**
 * Middleware helper to require specific permission
 */
export async function requirePermission(
  session: Session | null,
  permission: string
): Promise<boolean> {
  if (!session?.user?.role) {
    return false;
  }

  return hasPermission(session.user.role as UserRole, permission);
}

/**
 * Middleware helper to require any of the specified roles
 */
export async function requireRole(
  session: Session | null,
  roles: UserRole[]
): Promise<boolean> {
  if (!session?.user?.role) {
    return false;
  }

  return roles.includes(session.user.role as UserRole);
}
