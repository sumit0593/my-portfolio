import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Guest",
      credentials: {},
      async authorize() {
        // Generate unique guest ID per session to prevent session sharing
        return {
          id: `guest-${globalThis.crypto.randomUUID()}`,
          name: "Guest User",
          email: null,
          image: "",
          role: "guest",
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      // Persist role from user object into the JWT token
      if (user) {
        token.role = (user as any).role || "user";
      }
      return token;
    },
    async session({ session, token }) {
      // Expose role on the session object for client & server access
      if (session.user) {
        (session.user as any).role = token.role || "user";
        (session.user as any).id = token.sub;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Prevent open redirect attacks — only allow relative URLs or same-origin
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
})
