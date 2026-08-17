import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otp) {
          throw new Error("Missing email or code")
        }

        const { email, otp } = credentials

        // Find a valid OTP
        const validOtp = await prisma.oTP.findFirst({
          where: {
            email,
            code: otp,
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: 'desc' }
        })

        if (!validOtp) {
          throw new Error("Invalid or expired code")
        }

        // Delete the used OTP
        await prisma.oTP.deleteMany({
          where: { email }
        })

        // Find or create user
        let user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
          const isSuperAdmin = email === "mstelidevara123@gmail.com"
          user = await prisma.user.create({
            data: {
              email,
              name: email.split("@")[0],
              role: isSuperAdmin ? "SUPER_ADMIN" : "USER"
            }
          })
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET || "super-secret-key-for-development-only-change-in-prod"
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
