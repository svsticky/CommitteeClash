declare module 'next-auth' {
  interface Session {
    accessToken: string;
    is_admin: boolean;
    accessTokenExpires: number;
  }

  interface User {
    accessToken: string;
    is_admin: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string;
    is_admin: boolean;
    accessTokenExpires: number;
  }
}

export {};
