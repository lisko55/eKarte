import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/user";
import { createSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", req.url));
  }

  try {
    // 1. Zamijeni kod za Access Token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Google Token Error:", tokenData);
      throw new Error("Failed to get tokens");
    }

    // 2. Dohvati podatke o korisniku koristeći Access Token
    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );

    const googleUser = await userResponse.json();

    // 3. Spremi ili Ažuriraj u bazi
    await connectDB();

    let user = await User.findOne({ email: googleUser.email });

    if (!user) {
      // Kreiraj novog korisnika
      // Generiramo random password jer se logira preko Googlea
      const randomPassword = Math.random().toString(36).slice(-8);

      user = await User.create({
        name: googleUser.given_name,
        lastName: googleUser.family_name || "",
        email: googleUser.email,
        password: randomPassword, // Nije bitno, ne koristi se
        googleId: googleUser.id,
        avatar: googleUser.picture,
        isVerified: true, // Google korisnici su automatski verificirani
        role: "user",
      });
    } else {
      // Ako user postoji, ali nema googleId, dodaj ga (linkanje računa)
      if (!user.googleId) {
        user.googleId = googleUser.id;
        if (!user.avatar) user.avatar = googleUser.picture;
        await user.save();
      }
    }

    // 4. Kreiraj Sesiju (Isto kao kod običnog logina)
    await createSession({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      lastName: user.lastName,
      role: user.role,
      isAdmin: user.role === "admin" || user.role === "superadmin",
      avatar: user.avatar,
    });

    // 5. Redirect na naslovnu (uz query param da frontend zna spremiti u localStorage)
    // Moramo poslati podatke u URL-u da ih tvoj frontend (Login Page) može uhvatiti i spremiti u localStorage
    // Ovo je mali "hack" jer ne možemo pisati u localStorage iz API rute.
    const userData = encodeURIComponent(
      JSON.stringify({
        _id: user._id.toString(),
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      })
    );

    return NextResponse.redirect(
      new URL(`/login/success?user=${userData}`, req.url)
    );
  } catch (error) {
    console.error("Google Auth Error:", error);
    return NextResponse.redirect(new URL("/login?error=auth_failed", req.url));
  }
}
