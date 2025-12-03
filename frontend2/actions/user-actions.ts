"use server";

import connectDB from "@/lib/db";
import User from "@/models/user";
import { getSession } from "@/lib/session";

export async function getUserBalance() {
  try {
    await connectDB();
    const session = await getSession();
    if (!session || !session.userId) return 0;

    const user = await User.findById(session.userId).select("balance");
    return user?.balance || 0;
  } catch (error) {
    return 0;
  }
}
