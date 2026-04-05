"use server";

import connectDB from "@/lib/db";
import Coupon from "@/models/coupon";

export async function validateCoupon(code: string) {
  try {
    await connectDB();

    if (!code) return { error: "Unesite kod." };

    // Tražimo kupon po kodu (velikim slovima)
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return { error: "Kupon nije pronađen ili je neaktivan." };
    }

    // Provjera datuma isteka
    if (coupon.validUntil && new Date() > new Date(coupon.validUntil)) {
      return { error: "Ovaj kupon je istekao." };
    }

    // Provjera limita korištenja
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return { error: "Ovaj kupon je iskorišten maksimalan broj puta." };
    }

    // Ako je sve u redu, vraćamo podatke o popustu
    return {
      success: true,
      coupon: {
        _id: coupon._id.toString(),
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
    };
  } catch (error) {
    console.error("Greška pri validaciji kupona:", error);
    return { error: "Greška na serveru pri provjeri koda." };
  }
}
