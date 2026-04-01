"use server";

import connectDB from "@/lib/db";
import PartnerRequest from "@/models/partnerRequest";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { sendOrganizerWelcomeEmail } from "@/lib/mail";

export async function submitPartnerRequest(formData: FormData) {
  try {
    await connectDB();

    const organizationName = formData.get("organizationName") as string;
    const contactName = formData.get("contactName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const taxId = formData.get("taxId") as string;
    const message = formData.get("message") as string;

    // Osnovna validacija
    if (!organizationName || !contactName || !email || !phone) {
      return { error: "Molimo popunite sva obavezna polja." };
    }

    // 1. Provjeri da li je taj email već registrovan kao User
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return {
        error:
          "Ovaj email je već registrovan u sistemu. Molimo koristite drugi poslovni email.",
      };
    }

    // 2. Provjeri da li već postoji zahtjev na čekanju s ovim emailom
    const existingRequest = await PartnerRequest.findOne({ email });
    if (existingRequest) {
      return {
        error:
          "Već ste poslali zahtjev sa ovim emailom. Kontaktirat ćemo vas uskoro.",
      };
    }

    // 3. Spasi zahtjev u bazu
    await PartnerRequest.create({
      organizationName,
      contactName,
      email,
      phone,
      taxId,
      message,
      status: "pending",
    });

    return { success: true };
  } catch (error: any) {
    console.error("Greška pri slanju partner zahtjeva:", error);
    return { error: "Došlo je do sistemske greške. Pokušajte ponovo kasnije." };
  }
}
// --- DOHVAT SVIH ZAHTJEVA (ZA ADMINA) ---
export async function getPartnerRequests() {
  try {
    await connectDB();
    const session = await getSession();
    if (!session || !session.isAdmin) return [];

    const requests = await PartnerRequest.find().sort({ createdAt: -1 }).lean();

    return requests.map((req: any) => ({
      ...req,
      _id: req._id.toString(),
      createdAt: req.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Greška pri dohvatu zahtjeva:", error);
    return [];
  }
}

// --- ODOBRAVANJE ZAHTJEVA ---
export async function approvePartnerRequest(requestId: string) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session || !session.isAdmin) return { error: "Nije dozvoljeno" };

    const request = await PartnerRequest.findById(requestId);
    if (!request || request.status !== "pending")
      return { error: "Nevažeći zahtjev" };

    // 1. Kreiraj privremenu lozinku (npr. 8 nasumičnih karaktera)
    const plainPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // 2. Rastavi ime i prezime (ako je upisao zajedno)
    const nameParts = request.contactName.split(" ");
    const firstName = nameParts[0];
    const lastName =
      nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Partner";

    // 3. Kreiraj novog Organizatora u User tabeli
    await User.create({
      name: firstName,
      lastName: lastName,
      email: request.email,
      phone: request.phone,
      password: hashedPassword,
      organizationName: request.organizationName, // Zapisujemo naziv kluba
      role: "organizer",
      isVerified: true, // Automatski verificiran
    });

    // 4. Promijeni status zahtjeva
    request.status = "approved";
    await request.save();

    // 5. Pošalji Email
    await sendOrganizerWelcomeEmail(
      request.email,
      request.organizationName,
      plainPassword,
    );

    revalidatePath("/admin/partners");
    return { success: true };
  } catch (error: any) {
    console.error("Greška pri odobravanju:", error);
    return { error: "Sistemska greška pri odobravanju." };
  }
}

// --- ODBIJANJE ZAHTJEVA ---
export async function rejectPartnerRequest(requestId: string) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session || !session.isAdmin) return { error: "Nije dozvoljeno" };

    await PartnerRequest.findByIdAndUpdate(requestId, { status: "rejected" });

    revalidatePath("/admin/partners");
    return { success: true };
  } catch (error) {
    return { error: "Greška pri odbijanju." };
  }
}
