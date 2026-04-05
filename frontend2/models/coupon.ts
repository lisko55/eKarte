import mongoose, { Schema, model, models } from "mongoose";

const CouponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true, // Uvijek pretvara u velika slova (npr. Ljeto20 -> LJETO20)
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"], // percentage (npr. 20%) ili fixed (npr. 10 KM)
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
    },
    maxUses: {
      type: Number,
      default: null, // Ako je null, može se koristiti beskonačno puta
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    validUntil: {
      type: Date,
      default: null, // Ako je null, nikad ne ističe
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Coupon = models.Coupon || model("Coupon", CouponSchema);

export default Coupon;
