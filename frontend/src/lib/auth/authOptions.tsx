import type { NextAuthOptions } from 'next-auth';
import IdentityServer4Provider from 'next-auth/providers/identity-server4';
import { getSecret } from '../getSecret';

/**
 * Configuration options for NextAuth authentication.
 * This configuration uses IdentityServer4 as the OAuth provider.
 * It includes callbacks for handling JWT tokens and session management.
 *
 * @returns {NextAuthOptions} - The NextAuth options.
 */
export function createAuthOptions(): NextAuthOptions {
  const clientSecret = getSecret('oauth_client_secret');

  return {
    providers: [
      IdentityServer4Provider({
        id: process.env.NEXT_PUBLIC_OAUTH_PROVIDER_NAME!,
        name: process.env.NEXT_PUBLIC_OAUTH_PROVIDER_NAME!,
        clientId: process.env.OAUTH_CLIENT_ID!,
        clientSecret,
        issuer: process.env.NEXT_PUBLIC_OAUTH_PROVIDER_URL!,
      }),
    ],
    pages: {
      signIn: '/login',
      error: '/loginFailed',
    },
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
    secret: clientSecret,
  };
}
