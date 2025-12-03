import mongoose, { Schema, model, models } from "mongoose";

const TicketSchema = new Schema(
  {
    // --- RELACIJE ---
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    // Točno određeni tip ulaznice (npr. VIP vs Parter)
    ticketType: {
      _id: { type: Schema.Types.ObjectId, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
    },

    // --- VLASNIŠTVO ---
    // Trenutni vlasnik (mijenja se kod preprodaje)
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Originalni kupac (zauvijek ostaje isti, bitno za refundacije/probleme)
    originalOwner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Veza na narudžbu kojom je ova karta kupljena (mijenja se kod preprodaje)
    purchaseOrder: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    // --- SIGURNOST (TOTP & STATUS) ---
    // Tajni ključ za generiranje dinamičkog QR koda (mijenja se pri svakoj promjeni vlasnika)
    secretKey: {
      type: String,
      required: true,
      select: false, // Po defaultu sakriveno (security measure)
    },
    status: {
      type: String,
      enum: ["valid", "used", "revoked", "listed_for_resale"],
      default: "valid",
    },
    // Je li iskorištena na ulazu?
    usedAt: { type: Date },

    // --- RESALE MARKET ---
    isListed: { type: Boolean, default: false },
    resalePrice: { type: Number }, // Cijena po kojoj se prodaje (ako je listed)
    purchasePrice: { type: Number, required: true },

    // --- POVIJEST (Chain of Custody) ---
    // Pratimo tko je kome prodao kartu. Bitno za "Sad Path" (prevare).
    history: [
      {
        action: {
          type: String,
          enum: ["created", "transferred", "used", "listed", "unlisted"],
        },
        fromUser: { type: Schema.Types.ObjectId, ref: "User" },
        toUser: { type: Schema.Types.ObjectId, ref: "User" },
        date: { type: Date, default: Date.now },
        price: Number, // Ako je bila prodaja
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexi za brže pretraživanje
// (Brzo nađi sve karte jednog usera, ili sve karte za jedan event)
TicketSchema.index({ owner: 1 });
TicketSchema.index({ event: 1 });
TicketSchema.index({ status: 1 });

const Ticket = models.Ticket || model("Ticket", TicketSchema);

export default Ticket;
