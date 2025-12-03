import mongoose, { Schema, model, models } from "mongoose";

// Definiramo pod-shemu za tipove ulaznica
const TicketTypeSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  isSeated: { type: Boolean, default: false },
});

const EventSchema = new Schema(
  {
    title: { type: String, required: true }, // U starom kodu je 'title', ne 'name'
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    category: {
      type: String,
      enum: ["Muzika", "Sport", "Pozorište", "Film", "Ostalo"],
      required: true,
    },
    image: { type: String, required: true },
    ticketTypes: [TicketTypeSchema], // Niz tipova ulaznica
  },
  {
    timestamps: true,
  }
);

// Singleton pattern za Next.js (da ne kreira model više puta)
const Event = models.Event || model("Event", EventSchema);

export default Event;
