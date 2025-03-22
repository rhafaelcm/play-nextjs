import NextAuth from "next-auth/next";
import { authOptions } from "@/utils/auth";

// Export the handler as a named function for better debugging
const handler = NextAuth(authOptions);

// Configure Next.js API route
export { handler as GET, handler as POST };