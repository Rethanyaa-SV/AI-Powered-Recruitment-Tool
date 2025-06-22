import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import User from "@/models/User";

export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return null;
    }
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return null;
    }
    return user;
  } catch (error) {
    return null;
  }
}
