"use server";

import connectDB from "@/lib/db";
import Ticket from "@/models/ticket";
import EventModel from "@/models/event";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import * as OTPAuth from "otpauth";

export async function getSecureTicket(ticketId: string) {
  try {
    await connectDB();
    const session = await getSession();

    if (!session || !session.userId) return null;

    // Dohvati kartu, provjeri vlasnika I uključi secretKey
    const ticket = await Ticket.findOne({
      _id: ticketId,
      owner: session.userId,
    })
      .select("+secretKey") // <--- OVO JE KLJUČNO! Inace je undefined.
      .populate({
        path: "event",
        model: EventModel,
        select: "title date location image category",
      })
      .lean();

    if (!ticket) return null;
    console.log("DEBUG CIJENE:");
    console.log("Originalna cijena (Type):", ticket.ticketType.price);
    console.log("Plaćena cijena (Purchase):", ticket.purchasePrice);
    return {
      _id: ticket._id.toString(),
      secretKey: ticket.secretKey, // Šaljemo tajnu na frontend (samo vlasniku!)
      status: ticket.status,
      ownerName: session.name + " " + session.lastName,
      ticketType: ticket.ticketType,
      purchasePrice: ticket.purchasePrice,
      event: {
        title: ticket.event.title,
        location: ticket.event.location,
        image: ticket.event.image,
        date: ticket.event.date.toISOString(),
      },
    };
  } catch (error) {
    console.error("Greška pri dohvatu karte:", error);
    return null;
  }
}

export async function getMyTickets() {
  try {
    await connectDB();
    const session = await getSession();

    if (!session || !session.userId) return [];

    console.log("Dohvaćam karte za usera:", session.userId);

    const tickets = await Ticket.find({ owner: session.userId })
      .populate({
        path: "event",
        model: EventModel,
        select: "title date location image",
      })
      .sort({ createdAt: -1 })
      .lean();

    console.log("Pronađeno karata u bazi:", tickets.length);

    // Filtriramo karte koje nemaju event (npr. ako je event obrisan) da ne sruše app
    const validTickets = tickets.filter((t: any) => t.event != null);

    return validTickets.map((ticket: any) => ({
      _id: ticket._id.toString(),
      status: ticket.status,
      // Sigurnosna provjera za ticketType
      ticketType: ticket.ticketType || { name: "Nepoznato", price: 0 },
      createdAt: ticket.createdAt
        ? ticket.createdAt.toISOString()
        : new Date().toISOString(),
      // Ako polje purchasePrice ne postoji, koristi originalnu cijenu ili 0
      purchasePrice: ticket.purchasePrice ?? ticket.ticketType?.price ?? 0,
      event: {
        title: ticket.event.title,
        image: ticket.event.image,
        location: ticket.event.location,
        date: ticket.event.date
          ? ticket.event.date.toISOString()
          : new Date().toISOString(),
      },
    }));
  } catch (error) {
    console.error("Greška pri dohvatu ulaznica:", error);
    return [];
  }
}

export async function listTicketForSale(ticketId: string, price: number) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session || !session.userId) return { error: "Niste prijavljeni." };

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) return { error: "Karta nije pronađena." };
    if (ticket.owner.toString() !== session.userId)
      return { error: "Niste vlasnik ove karte." };
    if (ticket.status !== "valid")
      return { error: "Ova karta se ne može prodati." };

    // Sigurnosna provjera: Cijena ne smije biti veća od originalne (zakon protiv skalpiranja)
    // ticket.ticketType.price je originalna cijena
    // --- NOVA PROVJERA (DODAJEMO) ---
    // Ako polje purchasePrice ne postoji (stare karte), koristi originalnu cijenu kao fallback
    const maxAllowedPrice = ticket.purchasePrice || ticket.ticketType.price;

    if (price > maxAllowedPrice) {
      return {
        error: `Maksimalna cijena je ${maxAllowedPrice} KM (iznos koji ste vi platili).`,
      };
    }

    ticket.status = "listed_for_resale";
    ticket.resalePrice = price;
    ticket.isListed = true;

    // Dodajemo u historiju
    ticket.history.push({
      action: "listed",
      fromUser: session.userId,
      date: new Date(),
      price: price,
    });

    await ticket.save();

    revalidatePath("/my-tickets");
    revalidatePath(`/ticket/${ticketId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Greška pri listanju:", error);
    return { error: error.message };
  }
}

// --- OTKAZIVANJE PRODAJE ---
export async function cancelResale(ticketId: string) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session || !session.userId) return { error: "Niste prijavljeni." };

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) return { error: "Karta nije pronađena." };
    if (ticket.owner.toString() !== session.userId)
      return { error: "Niste vlasnik." };
    if (ticket.status !== "listed_for_resale")
      return { error: "Karta nije na prodaju." };

    ticket.status = "valid";
    ticket.isListed = false;
    ticket.resalePrice = undefined;

    ticket.history.push({
      action: "unlisted",
      fromUser: session.userId,
      date: new Date(),
    });

    await ticket.save();

    revalidatePath("/my-tickets");
    revalidatePath(`/ticket/${ticketId}`);
    return { success: true };
  } catch (error) {
    return { error: "Greška pri otkazivanju." };
  }
}

export async function getResaleTickets(eventId: string) {
  try {
    await connectDB();
    const session = await getSession();
    const currentUserId = session?.userId;

    // 1. Kreiramo osnovni query objekt
    const query: any = {
      event: eventId,
      status: "listed_for_resale",
    };

    // 2. Ako je korisnik logiran, dodajemo uvjet da NE vidi svoje karte
    if (currentUserId) {
      query.owner = { $ne: currentUserId };
    }

    // 3. Izvršavamo upit
    const tickets = await Ticket.find(query).sort({ resalePrice: 1 }).lean();

    // ... (ostatak mapiranja ostaje isti) ...
    return tickets.map((t: any) => {
      const tType = t.ticketType || {};
      return {
        _id: t._id.toString(),
        ticketType: {
          _id: tType._id ? tType._id.toString() : "unknown",
          name: tType.name || "Nepoznato",
          price: tType.price || 0,
        },
        resalePrice: t.resalePrice || 0,
        originalPrice: tType.price || 0,
      };
    });
  } catch (error) {
    console.error("Error fetching resale tickets:", error);
    return [];
  }
}
export async function validateTicketScan(qrData: string) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session || !session.isAdmin) return { error: "Niste autorizirani." };

    let ticketId = qrData;
    let totpToken = null;

    if (qrData.includes(":")) {
      const parts = qrData.split(":");
      ticketId = parts[0];
      totpToken = parts[1];
    }

    // --- POPRAVAK OVDJE ---
    // Moramo dodati .select("+secretKey") jer je po defaultu skriven
    const ticket = await Ticket.findById(ticketId)
      .select("+secretKey") // <--- OVO JE NEDOSTAJALO
      .populate("event")
      .populate("owner", "name lastName");
    // ---------------------

    if (!ticket) {
      return { error: "Ulaznica ne postoji u sistemu.", valid: false };
    }

    if (ticket.status === "used") {
      // --- POPRAVAK OVDJE ---
      // Ne smijemo vratiti cijeli 'ticket' objekt jer Next.js puca.
      // Moramo ručno izdvojiti podatke kao i kod uspjeha.
      return {
        error: `ALARM: Ulaznica je već iskorištena! (Ušla: ${
          ticket.usedAt
            ? new Date(ticket.usedAt).toLocaleTimeString()
            : "Nepoznato"
        })`,
        valid: false,
        ticketData: {
          eventName: ticket.event.title,
          ownerName: `${ticket.owner.name} ${ticket.owner.lastName}`,
          type: ticket.ticketType.name,
        },
      };
      // ---------------------
    }

    if (ticket.status === "listed_for_resale") {
      // I ovdje je dobro vratiti podatke da znamo čija je karta
      return {
        error: "STOP: Ulaznica je trenutno na prodaji!",
        valid: false,
        ticketData: {
          eventName: ticket.event.title,
          ownerName: `${ticket.owner.name} ${ticket.owner.lastName}`,
          type: ticket.ticketType.name,
        },
      };
    }

    if (ticket.status !== "valid") {
      return { error: "Ulaznica nije validna.", valid: false };
    }

    // Provjera TOTP-a
    if (totpToken) {
      // Dodatna provjera da secretKey postoji
      if (!ticket.secretKey) {
        return {
          error: "Greška sistema: Nedostaje tajni ključ ulaznice.",
          valid: false,
        };
      }

      const totp = new OTPAuth.TOTP({
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromHex(ticket.secretKey),
      });

      const delta = totp.validate({ token: totpToken, window: 1 });

      if (delta === null) {
        return {
          error: "Kod je istekao ili je neispravan (Screenshot?)",
          valid: false,
        };
      }
    }

    // USPJEŠAN ULAZ
    ticket.status = "used";
    ticket.usedAt = new Date();
    await ticket.save();

    return {
      success: true,
      valid: true,
      ticketData: {
        eventName: ticket.event.title,
        ownerName: `${ticket.owner.name} ${ticket.owner.lastName}`,
        type: ticket.ticketType.name,
      },
    };
  } catch (error) {
    console.error("Scan error:", error);
    return { error: "Greška pri očitanju koda.", valid: false };
  }
}
