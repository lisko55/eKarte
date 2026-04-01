"use server";

import connectDB from "@/lib/db";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import Ticket from "@/models/ticket";

// 1. DOHVATI SVE SKENERE OVOG ORGANIZATORA
export async function getMyScanners() {
  try {
    await connectDB();
    const session = await getSession();
    if (!session || session.role !== "organizer") return [];

    // Nađi sve skenere
    const scanners = await User.find({
      employer: session.userId,
      role: "scanner",
    })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    // Za svakog skenera prebroj koliko je karata očitao
    const scannersWithStats = await Promise.all(
      scanners.map(async (s: any) => {
        // Brojimo karte gdje je scannedBy jednak ID-u ovog skenera
        const scanCount = await Ticket.countDocuments({ scannedBy: s._id });

        return {
          _id: s._id.toString(),
          name: s.name,
          email: s.email,
          createdAt: s.createdAt.toISOString(),
          scanCount: scanCount, // <--- DODAJEMO BROJ SKENIRANJA
        };
      }),
    );

    return scannersWithStats;
  } catch (error) {
    console.error("Greška pri dohvatu skenera:", error);
    return [];
  }
}

// 2. KREIRAJ NOVOG SKENERA
export async function createScanner(formData: FormData) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session || session.role !== "organizer")
      return { error: "Nije dozvoljeno" };

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) return { error: "Sva polja su obavezna" };

    const existingUser = await User.findOne({ email });
    if (existingUser) return { error: "Email se već koristi." };

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      lastName: "Skener", // Default
      email,
      password: hashedPassword,
      phone: "-",
      role: "scanner",
      isVerified: true, // Skener ne mora potvrditi email
      employer: session.userId, // Vežemo ga za trenutnog organizatora
    });

    revalidatePath("/admin/scanners");
    return { success: true };
  } catch (error) {
    return { error: "Greška pri kreiranju skenera" };
  }
}

// 3. OBRIŠI SKENERA
export async function deleteScanner(scannerId: string) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session || session.role !== "organizer")
      return { error: "Nije dozvoljeno" };

    // Brišemo samo ako je ovaj organizator vlasnik tog skenera
    await User.findOneAndDelete({ _id: scannerId, employer: session.userId });

    revalidatePath("/admin/scanners");
    return { success: true };
  } catch (error) {
    return { error: "Greška pri brisanju" };
  }
}
