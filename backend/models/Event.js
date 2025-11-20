const mongoose = require("mongoose");

const TicketTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },

  isSeated: {
    type: Boolean,
    default: false,
  },
});

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    category: {
      type: String,
      enum: ["Muzika", "Sport", "Pozorište", "Film", "Ostalo"],
      required: true,
    },
    image: { type: String, required: true },

    ticketTypes: [TicketTypeSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Event", EventSchema);
