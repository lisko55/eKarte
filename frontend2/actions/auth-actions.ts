"use server";

import connectDB from "@/lib/db";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { createSession, deleteSession, getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/mail";

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) return { error: "Podaci nedostaju." };

  await connectDB();

  const existingUser = await User.findOne({ email });
  if (existingUser) return { error: "Email već postoji." };

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = uuidv4(); // Generiramo token

  await User.create({
    name,
    lastName,
    email,
    phone,
    password: hashedPassword,
    isVerified: false, // NIJE verificiran
    verificationToken,
  });

  // Pošalji email
  await sendVerificationEmail(email, verificationToken);

  return {
    success: true,
    message: "Račun kreiran! Provjerite email za aktivaciju.",
  };
}

// ... (loginUser i logoutUser ostaju isti, ali u loginUser možeš dodati lastName u sesiju ako želiš)
export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  await connectDB();
  const user = await User.findOne({ email });

  if (!user || !user.password) return { error: "Pogrešni podaci." };

  // --- NOVA PROVJERA ---
  if (!user.isVerified) {
    return { error: "Molimo potvrdite svoj email prije prijave." };
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return { error: "Neispravan email ili lozinka" };
  }

  // Kreiramo sesiju (Cookie) - Ovo ostaje isto
  await createSession({
    userId: user._id.toString(),
    name: user.name,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    isAdmin: user.role === "admin" || user.role === "superadmin",
  });

  // --- PROMJENA OVDJE ---
  // Umjesto redirect("/"), vraćamo objekt s korisnikom
  // Frontend će ovo primiti i spremiti u localStorage
  return {
    success: true,
    user: {
      _id: user._id.toString(),
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatar: user.avatar || "", // Ako nema avatara
    },
  };
}

export async function updateUserProfile(formData: FormData) {
  try {
    await connectDB();
    const session = await getSession();

    if (!session || !session.userId) {
      return { error: "Niste prijavljeni." };
    }

    const userId = session.userId;

    // Dohvati podatke iz forme
    const name = formData.get("name") as string;
    const lastName = formData.get("lastName") as string;
    const phone = formData.get("phone") as string;
    const avatar = formData.get("avatar") as string;
    const newPassword = formData.get("newPassword") as string;

    // Pripremi objekt za update
    const updateData: any = {
      name,
      lastName,
      phone,
      avatar,
    };

    // Ako je unesena nova lozinka, hashiraj je
    if (newPassword && newPassword.trim() !== "") {
      if (newPassword.length < 6) {
        return { error: "Lozinka mora imati najmanje 6 znakova." };
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    // Ažuriraj u bazi
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    // --- KLJUČNO: AŽURIRAJ SESIJU (COOKIE) ---
    // Moramo pregaziti stari kolačić s novim podacima
    await createSession({
      userId: updatedUser._id.toString(),
      name: updatedUser.name,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      isAdmin:
        updatedUser.role === "admin" || updatedUser.role === "superadmin",
    });

    return {
      success: true,
      user: {
        // Vraćamo podatke da ih frontend (localStorage) može ažurirati
        name: updatedUser.name,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
      },
    };
  } catch (error: any) {
    console.error("Profile update error:", error);
    return { error: "Greška pri ažuriranju profila." };
  }
}

export async function logoutUser() {
  await deleteSession();
  redirect("/login");
}
// 3. NOVA FUNKCIJA: VERIFIKACIJA EMAILA
export async function verifyEmailAction(token: string) {
  await connectDB();
  const user = await User.findOne({ verificationToken: token });

  if (!user) return { error: "Nevažeći token." };

  user.isVerified = true;
  user.verificationToken = undefined; // Obriši token
  await user.save();

  return { success: true };
}

// 4. NOVA FUNKCIJA: ZATRAŽI RESET LOZINKE
export async function forgotPasswordAction(email: string) {
  await connectDB();
  const user = await User.findOne({ email });

  if (!user) return { error: "Korisnik s tim emailom ne postoji." };

  const resetToken = uuidv4();
  // Token vrijedi 1 sat
  const expires = new Date(Date.now() + 3600000);

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpire = expires;
  await user.save();

  await sendPasswordResetEmail(email, resetToken);

  return { success: true, message: "Email za resetiranje poslan." };
}

// 5. NOVA FUNKCIJA: RESETIRAJ LOZINKU
export async function resetPasswordAction(token: string, newPassword: string) {
  await connectDB();

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() }, // Provjeri je li isteklo
  });

  if (!user) return { error: "Token je nevažeći ili je istekao." };

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  return { success: true, message: "Lozinka uspješno promijenjena." };
}
