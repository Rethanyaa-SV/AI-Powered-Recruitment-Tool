import CredentialsProvider from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@next-auth/mongodb-adapter"
import { MongoClient } from "mongodb"
import connectDB from "./mongoose"
import User from "@/models/User"
import bcrypt from "bcryptjs"

const client = new MongoClient(process.env.MONGODB_URI)
const clientPromise = client.connect()

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        await connectDB()

        const user = await User.findOne({ email: credentials.email })
        console.log(user)
        if (!user) {
          throw new Error("No user found with this email")
        }
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        console.log(isPasswordValid, user.password, credentials.password)
        if (!isPasswordValid) {
          throw new Error("Invalid password")
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          profile: user.profile,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.profile = user.profile
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub
        session.user.role = token.role
        session.user.profile = token.profile
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    signUp: "/register",
  },
}
