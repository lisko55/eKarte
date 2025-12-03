import mongoose, { Schema, model, models } from "mongoose";

const OrderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    orderItems: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        image: { type: String },
        event: {
          type: Schema.Types.ObjectId,
          ref: "Event",
          required: true,
        },
        ticketType: {
          type: Schema.Types.ObjectId, // ID specifične ulaznice
          required: true,
        },
      },
    ],
    paymentMethod: {
      type: String,
      required: true,
      default: "Stripe",
    },
    // Ovi podaci dolaze od Stripe-a nakon plaćanja
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Singleton pattern za Next.js
const Order = models.Order || model("Order", OrderSchema);

export default Order;
