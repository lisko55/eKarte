"use server";

import connectDB from "@/lib/db";
// PREIMENOVANJE: Uvozimo kao EventModel da izbjegnemo sudar s globalnim "Event" tipom
import EventModel from "@/models/event";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
// --- 1. DOHVAT SVIH DOGAĐAJA (Za Home Page) ---
export async function getEvents({
  keyword = "",
  category = "",
  page = 1,
  sort = "date_asc",
} = {}) {
  try {
    await connectDB();

    const pageSize = 10;
    const skip = pageSize * (page - 1);

    const query: any = {};

    if (keyword) {
      query.title = { $regex: keyword, $options: "i" };
    }

    if (category && category !== "Sve") {
      query.category = category;
    }

    let sortOption: any = { date: 1 };

    if (sort) {
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
    }

    const count = await EventModel.countDocuments(query);

    const eventsData = await EventModel.find(query)
      .sort(sortOption)
      .limit(pageSize)
      .skip(skip)
      .lean();

    // Mapiranje podataka
    const events = eventsData.map((event: any) => ({
      ...event,
      _id: event._id.toString(),
      date: event.date.toISOString(),
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      ticketTypes:
        event.ticketTypes?.map((t: any) => ({
          ...t,
          _id: t._id ? t._id.toString() : null,
        })) || [],
    }));

    return {
      events,
      page,
      pages: Math.ceil(count / pageSize),
      totalEvents: count,
    };
  } catch (error) {
    console.error("Greška u getEvents action:", error);
    return { events: [], page: 1, pages: 1, totalEvents: 0 };
  }
}

// --- 2. DOHVAT JEDNOG DOGAĐAJA PO ID-u (Za Event Details) ---
export async function getEventById(id: string) {
  try {
    await connectDB();

    console.log("--- DEBUG START ---");
    console.log("Tražim ID:", id);

    // Provjera formata ID-a
    if (!id || typeof id !== "string" || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return null;
    }

    // KORISTIMO EventModel (Novo ime)
    const event = await EventModel.findById(id).lean();

    if (!event) {
      console.log("MongoDB nije pronašao događaj s ovim ID-em.");
      return null;
    }

    console.log("Događaj pronađen:", (event as any).title);

    return {
      ...event,
      _id: (event as any)._id.toString(),
      date: (event as any).date.toISOString(),
      createdAt: (event as any).createdAt.toISOString(),
      updatedAt: (event as any).updatedAt.toISOString(),
      ticketTypes:
        (event as any).ticketTypes?.map((t: any) => ({
          ...t,
          _id: t._id ? t._id.toString() : null,
        })) || [],
    };
  } catch (error) {
    console.error("KRITIČNA GREŠKA u getEventById:", error);
    return null;
  }
}
export async function createEvent(data: any) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session || !session.isAdmin) return { error: "Nije dozvoljeno" };

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
    console.error("Create Event Error:", error);
    return { error: error.message || "Greška pri kreiranju" };
  }
}
export async function updateEvent(id: string, data: any) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session || !session.isAdmin) return { error: "Nije dozvoljeno" };

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
    console.error("Update Event Error:", error);
    return { error: error.message || "Greška pri ažuriranju" };
  }
}
export async function getRelatedEvents(
  category: string,
  currentEventId: string
) {
  try {
    await connectDB();

    const events = await EventModel.find({
      category: category, // Traži istu kategoriju
      _id: { $ne: currentEventId }, // NE prikazuj trenutni događaj
    })
      .sort({ date: 1 }) // Sortiraj po datumu (najskoriji prvi)
      .limit(4) // Prikaži max 4 slična
      .lean();

    return events.map((event: any) => ({
      ...event,
      _id: event._id.toString(),
      date: event.date.toISOString(),
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      ticketTypes:
        event.ticketTypes?.map((t: any) => ({
          ...t,
          _id: t._id ? t._id.toString() : null,
        })) || [],
      organizer: event.organizer ? event.organizer.toString() : null,
    }));
  } catch (error) {
    console.error("Greška pri dohvatu sličnih događaja:", error);
    return [];
  }
}
