import mongoose, { Schema, model, models } from "mongoose";

const PayoutRequestSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    iban: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "rejected"],
      default: "pending",
    },
    notes: {
      type: String, // Opcionalna napomena admina (npr. zašto je odbijeno)
    },
  },
  {
    timestamps: true,
  },
);

const PayoutRequest =
  models.PayoutRequest || model("PayoutRequest", PayoutRequestSchema);

export default PayoutRequest;
