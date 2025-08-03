const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
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
          type: mongoose.Schema.Types.ObjectId,
          ref: "Event",
          required: true,
        },
        ticketType: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
      },
    ],
    paymentMethod: {
      type: String,
      required: true,
      default: "Stripe",
    },
    paymentResult: {
      id: { type: String, unique: true, required: true },
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

module.exports = mongoose.model("Order", OrderSchema);
