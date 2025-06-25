import type { NextAuthOptions } from 'next-auth';
import IdentityServer4Provider from 'next-auth/providers/identity-server4';

/**
 * Configuration options for NextAuth authentication.
 * This configuration uses IdentityServer4 as the OAuth provider.
 * It includes callbacks for handling JWT tokens and session management.
 *
 * @type {NextAuthOptions}
 */
export const authOptions: NextAuthOptions = {
  providers: [
    IdentityServer4Provider({
      id: 'sticky',
      name: 'Sticky',
      clientId: process.env.OAUTH_CLIENT_ID!,
      clientSecret: process.env.OAUTH_CLIENT_SECRET!,
      issuer: process.env.NEXT_PUBLIC_OAUTH_PROVIDER_URL!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.accessToken = account.access_token!;
        token.accessTokenExpires = 1000 * (account.expires_at ?? 0);
        const typedProfile = profile as { is_admin: boolean };
        token.is_admin = typedProfile.is_admin;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.is_admin = token.is_admin;
      session.accessTokenExpires = token.accessTokenExpires;
      return session;
    },
  },
  secret: process.env.OAUTH_CLIENT_SECRET!,
};
