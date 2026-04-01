"use server";

import connectDB from "@/lib/db";
import PayoutRequest from "@/models/payoutRequest";
import User from "@/models/user";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

// 1. KORISNIK TRAŽI ISPLATU
export async function requestPayout(formData: FormData) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session || !session.userId) return { error: "Niste prijavljeni." };

    const amount = Number(formData.get("amount"));
    const iban = formData.get("iban") as string;

    if (!amount || amount <= 0 || !iban) {
      return { error: "Unesite validan iznos i IBAN." };
    }

    const user = await User.findById(session.userId);
    if (!user) return { error: "Korisnik nije pronađen." };

    if (amount > user.balance) {
      return { error: "Nemate dovoljno sredstava na računu." };
    }

    // Odmah skidamo pare s računa da ih ne može potrošiti dvaput
    user.balance -= amount;
    await user.save();

    // Kreiramo zahtjev
    await PayoutRequest.create({
      user: session.userId,
      amount,
      iban,
      status: "pending",
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error: any) {
    return { error: "Greška pri kreiranju zahtjeva." };
  }
}

// 2. ADMIN DOHVATA SVE ZAHTJEVE
export async function getAllPayoutRequests(statusFilter: string = "pending") {
  try {
    await connectDB();
    const session = await getSession();
    if (!session || !session.isAdmin) return [];

    const query = statusFilter === "all" ? {} : { status: statusFilter };

    const requests = await PayoutRequest.find(query)
      .populate("user", "name lastName email")
      .sort({ createdAt: -1 })
      .lean();

    return requests.map((req: any) => ({
      _id: req._id.toString(),
      amount: req.amount,
      iban: req.iban,
      status: req.status,
      createdAt: req.createdAt.toISOString(),
      user: req.user
        ? {
            name: req.user.name,
            lastName: req.user.lastName,
            email: req.user.email,
          }
        : { name: "Nepoznato", lastName: "", email: "" },
    }));
  } catch (error) {
    return [];
  }
}

// 3. ADMIN ODOBRAVA ILI ODBIJA ZAHTJEV
export async function resolvePayout(
  requestId: string,
  action: "approve" | "reject",
) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session || !session.isAdmin) return { error: "Nije dozvoljeno." };

    const request = await PayoutRequest.findById(requestId);
    if (!request || request.status !== "pending") {
      return { error: "Zahtjev nije validan ili je već obrađen." };
    }

    if (action === "approve") {
      request.status = "completed";
    } else if (action === "reject") {
      request.status = "rejected";
      // Vraćamo novac na korisnički nalog jer je isplata odbijena
      await User.findByIdAndUpdate(request.user, {
        $inc: { balance: request.amount },
      });
    }

    await request.save();
    revalidatePath("/admin/payouts");
    return { success: true };
  } catch (error) {
    return { error: "Greška pri obradi zahtjeva." };
  }
}
