import mongoose, { Schema, model, models } from "mongoose";

const PartnerRequestSchema = new Schema(
  {
    organizationName: { type: String, required: true },
    contactName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    taxId: { type: String },
    message: { type: String },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending", // Svi novi zahtjevi automatski idu na čekanje
    },
  },
  {
    timestamps: true,
  },
);

const PartnerRequest =
  models.PartnerRequest || model("PartnerRequest", PartnerRequestSchema);

export default PartnerRequest;
