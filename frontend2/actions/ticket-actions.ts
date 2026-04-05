"use server";

import crypto from "crypto";
import connectDB from "@/lib/db";
import Ticket from "@/models/ticket";
import EventModel from "@/models/event";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import * as OTPAuth from "otpauth";
import User from "@/models/user";
import Order from "@/models/order";
import QRCode from "qrcode";
import { sendTicketEmail } from "@/lib/mail";

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

    // --- POPRAVAK: Dozvoli Adminu, Organizatoru i Skeneru ---
    const isAllowed =
      session &&
      (session.isAdmin ||
        session.role === "organizer" ||
        session.role === "scanner");
    if (!isAllowed) return { error: "Niste autorizirani.", valid: false };

    let ticketId = qrData;
    let totpToken = null;

    if (qrData.includes(":")) {
      const parts = qrData.split(":");
      ticketId = parts[0];
      totpToken = parts[1];
    }

    const ticket = await Ticket.findById(ticketId)
      .select("+secretKey")
      .populate("event")
      .populate("owner", "name lastName");

    if (!ticket)
      return { error: "Ulaznica ne postoji u sistemu.", valid: false };

    // --- NOVA SIGURNOSNA PROVJERA ZA SKENERA ---
    // Ako je korisnik "skener", moramo provjeriti da li karta pripada njegovom šefu (organizatoru)
    if (session.role === "scanner") {
      const scannerUser = await User.findById(session.userId).select(
        "employer",
      );
      if (
        ticket.event.organizer?.toString() !== scannerUser?.employer?.toString()
      ) {
        return {
          error: "ZABRANJENO: Ova ulaznica pripada drugom organizatoru!",
          valid: false,
        };
      }
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
    ticket.scannedBy = session.userId; // Bilježimo koji skener je skenirao kartu
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

function generateSecret() {
  return crypto.randomBytes(20).toString("hex");
}

// --- IZDAVANJE GRATIS ULAZNICA ---
export async function issueFreeTicket(formData: FormData) {
  try {
    await connectDB();
    const session = await getSession();

    if (!session || (!session.isAdmin && session.role !== "organizer")) {
      return { error: "Nije dozvoljeno." };
    }

    const eventId = formData.get("eventId") as string;
    const ticketTypeId = formData.get("ticketTypeId") as string;
    const quantity = Number(formData.get("quantity"));
    const guestName = formData.get("guestName") as string;
    const guestEmail = formData.get("guestEmail") as string;

    if (!eventId || !ticketTypeId || !quantity || !guestName || !guestEmail) {
      return { error: "Sva polja su obavezna." };
    }

    // 1. Provjera vlasništva nad događajem (ako je organizator)
    const event = await EventModel.findById(eventId);
    if (!event) return { error: "Događaj nije pronađen." };

    if (
      session.role === "organizer" &&
      event.organizer?.toString() !== session.userId
    ) {
      return { error: "Ovo nije vaš događaj!" };
    }

    const ticketType = event.ticketTypes.find(
      (t: any) => t._id.toString() === ticketTypeId,
    );
    if (!ticketType) return { error: "Tip ulaznice ne postoji." };

    if (ticketType.quantity < quantity) {
      return {
        error: `Nema dovoljno dostupnih ulaznica (Ostalo: ${ticketType.quantity}).`,
      };
    }

    // 2. Kreiranje "Nultog" Ordera (Da imamo trag kome smo izdali)
    const newOrder = await Order.create({
      user: session.userId, // Vežemo na organizatora jer guest možda nema account
      orderItems: [
        {
          name: `${event.title} - ${ticketType.name} (GRATIS)`,
          quantity: quantity,
          price: 0,
          image: event.image,
          event: eventId,
          ticketType: ticketTypeId,
        },
      ],
      paymentMethod: "Gratis",
      paymentResult: {
        id: "GRATIS_" + Date.now(),
        status: "completed",
        email_address: guestEmail,
      },
      totalPrice: 0,
      isPaid: true,
      paidAt: new Date(),
    });

    // 3. Smanjenje zaliha
    await EventModel.updateOne(
      { _id: eventId, "ticketTypes._id": ticketTypeId },
      { $inc: { "ticketTypes.$.quantity": -quantity } },
    );

    // 4. Kreiranje Ticketa i generiranje QR kodova za mail
    const ticketDataForEmail = [];

    for (let i = 0; i < quantity; i++) {
      const secret = generateSecret();

      const newTicket = await Ticket.create({
        event: eventId,
        ticketType: {
          _id: ticketTypeId,
          name: ticketType.name,
          price: 0, // Gratis karta vrijedi 0
        },
        owner: session.userId, // Tehnički je vlasnik org, ali karta glasi na ime gosta
        originalOwner: session.userId,
        purchaseOrder: newOrder._id,
        purchasePrice: 0,
        secretKey: secret,
        status: "valid",
        history: [
          {
            action: "created",
            fromUser: session.userId,
            toUser: session.userId,
            price: 0,
          },
        ],
      });

      const uniqueTicketId = `${newOrder._id}-${ticketTypeId}-${i}`;
      const qrCodeDataUrl = await QRCode.toDataURL(uniqueTicketId);

      ticketDataForEmail.push({
        eventName: event.title,
        ticketType: ticketType.name + " (GRATIS)",
        price: 0,
        qrCodeDataUrl,
        uniqueId: newTicket._id.toString(), // Koristimo stvarni ID karte
      });
    }

    // 5. Slanje Maila Gosti
    try {
      await sendTicketEmail({
        customerName: guestName, // Ime gosta
        customerEmail: guestEmail, // Email gosta
        orderId: newOrder._id.toString(),
        totalPrice: 0,
        tickets: ticketDataForEmail,
        isFreeTicket: true,
      });
    } catch (e) {
      console.error("Greška pri slanju gratis maila:", e);
    }

    // Osvježavanje UI-a
    revalidatePath(`/admin/events/${eventId}/analytics`);
    return { success: true };
  } catch (error: any) {
    console.error("Greška pri izdavanju gratis karte:", error);
    return { error: error.message };
  }
}
export async function transferTicket(ticketId: string, receiverEmail: string) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session || !session.userId) return { error: "Niste prijavljeni." };

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) return { error: "Karta nije pronađena." };
    if (ticket.owner.toString() !== session.userId)
      return { error: "Niste vlasnik ove karte." };
    if (ticket.status !== "valid")
      return { error: "Ova karta se trenutno ne može poslati." };

    // 1. Pronađi prijatelja u bazi po emailu
    const receiverEmailLower = receiverEmail.toLowerCase().trim();
    const receiver = await User.findOne({ email: receiverEmailLower });

    if (!receiver) {
      return {
        error:
          "Korisnik sa ovim emailom ne postoji. Zamolite prijatelja da besplatno kreira račun na eKarte, a zatim ponovite slanje.",
      };
    }

    if (receiver._id.toString() === session.userId) {
      return { error: "Ne možete poslati ulaznicu sami sebi." };
    }

    // 2. Transfer vlasništva i novi ključ
    const newSecret = generateSecret();

    ticket.owner = receiver._id;
    ticket.secretKey = newSecret;
    // Ostavljamo isti status ('valid') i istu purchasePrice

    // Dodajemo u historiju
    ticket.history.push({
      action: "transferred",
      fromUser: session.userId,
      toUser: receiver._id,
      date: new Date(),
      price: 0, // Transfer je besplatan (poklon)
    });

    await ticket.save();

    // 3. Opcionalno: Ovdje bi mogao pozvati sendMail funkciju da obavijestiš prijatelja
    // "Hej, dobili ste ulaznicu od [Ime]!"

    revalidatePath("/my-tickets");
    revalidatePath(`/ticket/${ticketId}`);

    return { success: true };
  } catch (error: any) {
    console.error("Greška pri transferu:", error);
    return { error: "Sistemska greška pri slanju ulaznice." };
  }
}
