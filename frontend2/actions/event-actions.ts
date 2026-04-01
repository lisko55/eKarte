"use server";

import connectDB from "@/lib/db";
import EventModel from "@/models/event";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import mongoose from "mongoose";
import Ticket from "@/models/ticket";
import User from "@/models/user";

// ========================
// 🔥 DTO / SERIALIZER
// ========================
function serializeEvent(event: any) {
  return {
    _id: event._id?.toString(),
    title: event.title,
    description: event.description,
    date: event.date?.toISOString(),
    location: event.location,
    category: event.category,
    image: event.image,

    ticketTypes:
      event.ticketTypes?.map((t: any) => ({
        ...t,
        _id: t._id?.toString?.() || null,
      })) || [],

    organizer: event.organizer
      ? {
          _id: event.organizer._id?.toString?.(),
          name: event.organizer.name,
          lastName: event.organizer.lastName,
        }
      : null,

    organizerName: event.organizer
      ? `${event.organizer.name} ${event.organizer.lastName}`
      : "Nepoznat",

    createdAt: event.createdAt?.toISOString(),
    updatedAt: event.updatedAt?.toISOString(),
  };
}

// ========================
// 1. GET EVENTS (HOME)
// ========================
export async function getEvents(
  { keyword = "", category = "", page = 1, sort = "date_asc" } = {} as any,
) {
  try {
    await connectDB();

    const pageSize = 10;
    const skip = pageSize * (page - 1);

    const query: any = {};

    if (keyword) {
      query.title = { $regex: keyword, $options: "i" };
    }

    if (category && category !== "all") {
      query.category = category;
    }

    let sortOption: any = { date: 1 };

    switch (sort) {
      case "date_desc":
        sortOption = { date: -1 };
        break;
      case "price_asc":
        sortOption = { "ticketTypes.0.price": 1 };
        break;
      case "price_desc":
        sortOption = { "ticketTypes.0.price": -1 };
        break;
      default:
        sortOption = { date: 1 };
    }

    const count = await EventModel.countDocuments(query);

    const events = await EventModel.find(query)
      .populate({
        path: "organizer",
        model: User,
        select: "name lastName",
      })
      .sort(sortOption)
      .limit(pageSize)
      .skip(skip)
      .lean();

    return {
      events: events.map(serializeEvent),
      page,
      pages: Math.ceil(count / pageSize),
      totalEvents: count,
    };
  } catch (error) {
    console.error("getEvents error:", error);
    return { events: [], page: 1, pages: 1, totalEvents: 0 };
  }
}

// ========================
// 2. GET EVENT BY ID
// ========================
export async function getEventById(id: string) {
  try {
    await connectDB();

    if (!id || typeof id !== "string") return null;

    const event = await EventModel.findById(id)
      .populate("organizer", "name lastName")
      .lean();

    if (!event) return null;

    return serializeEvent(event);
  } catch (error) {
    console.error("getEventById error:", error);
    return null;
  }
}

// ========================
// 3. CREATE EVENT
// ========================
export async function createEvent(data: any) {
  try {
    await connectDB();
    const session = await getSession();

    if (!session || (!session.isAdmin && session.role !== "organizer")) {
      return { error: "Nije dozvoljeno" };
    }

    await EventModel.create({
      title: data.title,
      description: data.description,
      date: data.date,
      location: data.location,
      category: data.category,
      image: data.image,
      ticketTypes: data.ticketTypes,
      organizer: session.userId,
    });

    revalidatePath("/");
    revalidatePath("/admin/eventlist");

    return { success: true };
  } catch (error: any) {
    console.error("createEvent error:", error);
    return { error: error.message };
  }
}

// ========================
// 4. UPDATE EVENT
// ========================
export async function updateEvent(id: string, data: any) {
  try {
    await connectDB();
    const session = await getSession();

    if (!session || !session.isAdmin) {
      return { error: "Nije dozvoljeno" };
    }

    await EventModel.findByIdAndUpdate(id, {
      title: data.title,
      description: data.description,
      date: data.date,
      location: data.location,
      category: data.category,
      image: data.image,
      ticketTypes: data.ticketTypes,
    });

    revalidatePath("/");
    revalidatePath(`/event/${id}`);
    revalidatePath("/admin/eventlist");

    return { success: true };
  } catch (error: any) {
    console.error("updateEvent error:", error);
    return { error: error.message };
  }
}

// ========================
// 5. RELATED EVENTS
// ========================
export async function getRelatedEvents(
  category: string,
  currentEventId: string,
) {
  try {
    await connectDB();

    const events = await EventModel.find({
      category,
      _id: { $ne: currentEventId },
    })
      .sort({ date: 1 })
      .limit(4)
      .lean();

    return events.map(serializeEvent);
  } catch (error) {
    console.error("getRelatedEvents error:", error);
    return [];
  }
}

// ========================
// 6. ADMIN EVENTS
// ========================
export async function getAdminEvents(page: number = 1) {
  try {
    await connectDB();
    const session = await getSession();

    if (!session || (!session.isAdmin && session.role !== "organizer")) {
      return { events: [], pages: 0 };
    }

    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    const filter: any = {};

    if (session.role === "organizer") {
      filter.organizer = session.userId;
    }

    const count = await EventModel.countDocuments(filter);

    const events = await EventModel.find(filter)
      .populate("organizer", "name lastName")
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(skip)
      .lean();
    return {
      events: events.map(serializeEvent),
      pages: Math.ceil(count / pageSize),
    };
  } catch (error) {
    console.error("getAdminEvents error:", error);
    return { events: [], pages: 0 };
  }
}
export async function getSingleEventAnalytics(eventId: string) {
  try {
    await connectDB();
    const session = await getSession();

    if (!session || (!session.isAdmin && session.role !== "organizer")) {
      return null;
    }

    // 1. Dohvati događaj
    const event = await EventModel.findById(eventId).lean();
    if (!event) return null;

    // Sigurnost: Organizator smije gledati samo svoje događaje
    if (
      session.role === "organizer" &&
      event.organizer?.toString() !== session.userId
    ) {
      return null;
    }

    // 2. Izračunaj statistiku iz Ticket kolekcije (Ovo je preciznije od Orders)
    // Sve prodane karte
    const soldTickets = await Ticket.countDocuments({
      event: eventId,
      status: { $ne: "revoked" },
    });

    // Sve SKENIRANE karte (Ljudi koji su ušli)
    const scannedTickets = await Ticket.countDocuments({
      event: eventId,
      status: "used",
    });

    // 3. Zarada i pregled po tipu karte
    const ticketStats = await Ticket.aggregate([
      {
        $match: {
          event: new mongoose.Types.ObjectId(eventId),
          status: { $ne: "revoked" },
        },
      },
      {
        $group: {
          _id: "$ticketType.name",
          count: { $sum: 1 },
          revenue: { $sum: "$purchasePrice" }, // Koristimo purchasePrice koji smo uveli!
        },
      },
    ]);

    const totalRevenue = ticketStats.reduce(
      (sum, item) => sum + item.revenue,
      0,
    );

    // 4. Izračunaj ukupan kapacitet (Prodane + One koje su još u prodaji u Event modelu)
    const remainingTickets = event.ticketTypes.reduce(
      (sum: number, t: any) => sum + t.quantity,
      0,
    );
    const totalCapacity = soldTickets + remainingTickets;

    return {
      eventTitle: event.title,
      eventDate: event.date.toISOString(),
      isPast: new Date(event.date) < new Date(),
      // Status za "Arhivu"
      ticketTypes: event.ticketTypes.map((t: any) => ({
        _id: t._id.toString(),
        name: t.name,
        quantity: t.quantity,
      })),
      stats: {
        totalCapacity,
        soldTickets,
        remainingTickets,
        scannedTickets,
        totalRevenue,
        attendanceRate:
          soldTickets > 0
            ? Math.round((scannedTickets / soldTickets) * 100)
            : 0,
        salesRate:
          totalCapacity > 0
            ? Math.round((soldTickets / totalCapacity) * 100)
            : 0,
      },
      ticketBreakdown: ticketStats,
    };
  } catch (error) {
    console.error("Greška u event analytics:", error);
    return null;
  }
}
