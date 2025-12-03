import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSession } from "@/lib/session";
import User from "@/models/user";
import connectDB from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await getSession();
    const { amount, useCredit } = await req.json(); // <--- PRIMAMO useCredit ZASTAVICU

    if (!amount) {
      return new NextResponse("Amount is required", { status: 400 });
    }

    let finalAmount = amount;

    // Ako korisnik želi koristiti kredit, moramo provjeriti koliko ima
    if (useCredit && session?.userId) {
      const user = await User.findById(session.userId);
      const balance = user?.balance || 0;

      // Oduzimamo balans od cijene
      finalAmount = amount - balance;
    }

    // Ako je iznos manji od 0, stavljamo 0
    if (finalAmount < 0) finalAmount = 0;

    // Ako je iznos 0 (sve pokriveno kreditom), ne treba nam Stripe Intent
    // Vraćamo null clientSecret, frontend će znati šta s tim
    if (finalAmount === 0) {
      return NextResponse.json({ clientSecret: null, amountToPay: 0 });
    }

    // Stripe traži najmanje 1 KM (ili 0.50 EUR) za transakciju
    // Ako je preostalo npr 0.20 KM, moramo ili to pokloniti ili prisiliti minimalnu naplatu
    // Za sada pretpostavimo da je > 1 KM

    const amountInCents = Math.round(finalAmount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "bam",
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amountToPay: finalAmount, // Šaljemo nazad koliko stvarno treba platiti karticom
    });
  } catch (error: any) {
    console.error("Stripe Error:", error);
    return new NextResponse(error.message, { status: 500 });
  }
}
