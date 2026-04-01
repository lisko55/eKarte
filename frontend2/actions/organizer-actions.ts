"use server";

import connectDB from "@/lib/db";
import Order from "@/models/order";
import EventModel from "@/models/event";
import { getSession } from "@/lib/session";

export async function getOrganizerStats() {
  try {
    await connectDB();
    const session = await getSession();

    if (!session || session.role !== "organizer") {
      throw new Error("Nije dozvoljeno");
    }

    const organizerId = session.userId;

    // 1. Nađi sve događaje ovog organizatora
    const myEvents = await EventModel.find({ organizer: organizerId }).select(
      "_id",
    );
    const myEventIds = myEvents.map((e) => e._id);

    const activeEventCount = myEvents.length;

    // 2. Izračunaj zaradu i prodane karte SAMO za te događaje
    const stats = await Order.aggregate([
      { $unwind: "$orderItems" }, // Razdvoji narudžbe na pojedinačne stavke
      { $match: { "orderItems.event": { $in: myEventIds }, isPaid: true } }, // Filtriraj samo stavke mojih događaja
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] },
          },
          totalTickets: { $sum: "$orderItems.quantity" },
        },
      },
    ]);

    // 3. Top prodavani događaji (Samo moji)
    const topSellingEvents = await Order.aggregate([
      { $unwind: "$orderItems" },
      { $match: { "orderItems.event": { $in: myEventIds }, isPaid: true } },
      {
        $group: {
          _id: "$orderItems.event",
          totalTicketsSold: { $sum: "$orderItems.quantity" },
        },
      },
      { $sort: { totalTicketsSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "events",
          localField: "_id",
          foreignField: "_id",
          as: "eventDetails",
        },
      },
      { $unwind: "$eventDetails" },
      {
        $project: {
          title: "$eventDetails.title",
          totalTicketsSold: 1,
        },
      },
    ]);

    const totalSales = stats.length > 0 ? stats[0].totalRevenue : 0;
    const totalTickets = stats.length > 0 ? stats[0].totalTickets : 0;

    return {
      activeEventCount,
      totalSales,
      totalTickets,
      topSellingEvents,
    };
  } catch (error) {
    console.error("Greška u organizer stats:", error);
    return null;
  }
}
