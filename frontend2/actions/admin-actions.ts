"use server";

import connectDB from "@/lib/db";
import Order from "@/models/order";
import User from "@/models/user";
import EventModel from "@/models/event";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
// Helper za nazive mjeseci (bs-BA)
function getBosnianMonthName(index: number) {
  return new Date(2024, index, 1).toLocaleString("bs-BA", { month: "long" });
}

export async function getDashboardStats() {
  try {
    await connectDB();
    const session = await getSession();

    if (!session || !session.isAdmin) {
      throw new Error("Nije dozvoljeno");
    }

    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // 1. Paralelni dohvat
    const [
      userCount,
      newUsersThisMonth,
      activeEventCount,
      totalSalesData,
      totalTicketsData
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ createdAt: { $gte: firstDayOfMonth } }),
      EventModel.countDocuments({ date: { $gte: today } }),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: "$totalPrice" } } }
      ]),
      Order.aggregate([
        { $unwind: "$orderItems" },
        { $group: { _id: null, total: { $sum: "$orderItems.quantity" } } }
      ])
    ]);

    // 2. Zarada po mjesecima
    const monthlyRevenueRaw = await Order.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          total: { $sum: "$totalPrice" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthlyRevenue = monthlyRevenueRaw.map((item) => {
      const date = new Date();
      date.setMonth(item._id.month - 1);

      return {
        name: date.toLocaleString("bs-BA", { month: "short" }),
        total: item.total
      };
    });

    // 3. Top prodavani događaji
    const topSellingEvents = await Order.aggregate([
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.event",
          totalTicketsSold: { $sum: "$orderItems.quantity" }
        }
      },
      { $sort: { totalTicketsSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "events",
          localField: "_id",
          foreignField: "_id",
          as: "eventDetails"
        }
      },
      { $unwind: "$eventDetails" },
      {
        $project: {
          title: "$eventDetails.title",
          totalTicketsSold: 1
        }
      }
    ]);

    const totalSales = totalSalesData.length > 0 ? totalSalesData[0].total : 0;
    const totalTickets =
      totalTicketsData.length > 0 ? totalTicketsData[0].total : 0;

    return {
      userCount,
      newUsersThisMonth,
      activeEventCount,
      totalSales,
      totalTickets,
      topSellingEvents,
      monthlyRevenue
    };
  } catch (error) {
    console.error("Greška u dashboard stats:", error);
    return null;
  }
}

export async function getRevenueAnalytics(year: number, month?: number) {
  try {
    await connectDB();
    const session = await getSession();

    if (!session || !session.isAdmin) {
      throw new Error("Nije dozvoljeno");
    }

    // 1. Određivanje opsega datuma
    let startDate: Date;
    let endDate: Date;

    if (month) {
      // Za određeni mjesec
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Za cijelu godinu
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    }

    // 2. Ukupan revenue
    const totalRevenueResult = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);

    const totalRevenue =
      totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

    // 3. Podaci za graf
    let chartDataRaw;

    if (month) {
      // Po danima u mjesecu
      chartDataRaw = await Order.aggregate([
        {
          $match: {
            isPaid: true,
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: { day: { $dayOfMonth: "$createdAt" } },
            total: { $sum: "$totalPrice" }
          }
        },
        { $sort: { "_id.day": 1 } }
      ]);

      return {
        totalRevenue,
        chartData: chartDataRaw.map((item) => ({
          name: `${item._id.day}.`,
          total: item.total
        }))
      };
    }

    // Po mjesecima u godini
    chartDataRaw = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          total: { $sum: "$totalPrice" }
        }
      },
      { $sort: { "_id.month": 1 } }
    ]);

    // Popunjavanje svih mjeseci
    const fullYearData = Array.from({ length: 12 }, (_, i) => {
      const found = chartDataRaw.find((item) => item._id.month === i + 1);
      return {
        name: getBosnianMonthName(i),
        total: found ? found.total : 0
      };
    });

    return {
      totalRevenue,
      chartData: fullYearData
    };
  } catch (error) {
    console.error("Greška u revenue analytics:", error);
    return { totalRevenue: 0, chartData: [] };
  }
}
export async function getAllUsers(query: string = "", page: number = 1) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session || !session.isAdmin) return { users: [], totalPages: 0, currentUserRole: "user" };

    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    const filter: any = {};
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } }
      ];
    }

    const count = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select("-password")
      .limit(pageSize)
      .skip(skip)
      .sort({ createdAt: -1 })
      .lean();

    return {
      users: users.map((u: any) => ({
        ...u,
        _id: u._id.toString(),
        createdAt: u.createdAt.toISOString(),
      })),
      totalPages: Math.ceil(count / pageSize),
      currentUserRole: session.role || "user", // Vraćamo rolu trenutnog admina
    };
  } catch (error) {
    return { users: [], totalPages: 0, currentUserRole: "user" };
  }
}

// 2. NOVA FUNKCIJA ZA LIVE SEARCH (DROPDOWN)
// Vraća samo ID, ime i email za brzi prikaz u tražilici
export async function searchUsersPreview(query: string) {
  try {
    await connectDB();
    if (!query) return [];

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } }
      ]
    })
    .select("name lastName email") // Samo osnovno
    .limit(5) // Max 5 rezultata u dropdownu
    .lean();

    return users.map((u: any) => ({
      _id: u._id.toString(),
      name: u.name,
      lastName: u.lastName,
      email: u.email
    }));
  } catch (error) {
    return [];
  }
}

// 3. AŽURIRANA PROMJENA ULOGE (SAMO SUPERADMIN)
export async function toggleUserRole(userId: string, currentRole: string) {
  try {
    await connectDB();
    const session = await getSession();
    
    // PROVJERA: Samo SUPERADMIN može ovo raditi
    if (!session || session.role !== "superadmin") { 
      return { error: "Samo SuperAdmin može mijenjati uloge!" };
    }

    if (userId === session.userId) {
      return { error: "Ne možete mijenjati svoju ulogu!" };
    }

    const newRole = currentRole === "admin" ? "user" : "admin";
    // Ako je novi role "admin", isAdmin je true. Ako je "user", false.
    const isAdmin = newRole === "admin";

    await User.findByIdAndUpdate(userId, { role: newRole, isAdmin: isAdmin });

    revalidatePath("/admin/userlist");
    return { success: true };
  } catch (error) {
    return { error: "Greška pri promjeni uloge" };
  }
}

// ... (deleteUser ostaje sličan, ali dodaj provjeru za superadmina ako želiš) ...
export async function deleteUser(userId: string) {
    try {
      await connectDB();
      const session = await getSession();
      // Dozvoljavamo brisanje adminu, ali ne brisanje drugog admina (osim ako si superadmin)
      // Radi jednostavnosti ovdje:
      if (!session || !session.isAdmin) return { error: "Nije dozvoljeno" };
  
      await User.findByIdAndDelete(userId);
      revalidatePath("/admin/userlist");
      return { success: true };
    } catch (error) {
      return { error: "Greška pri brisanju" };
    }
  }
  // --- BRISANJE DOGAĐAJA ---
export async function deleteEvent(eventId: string) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session || !session.isAdmin) return { error: "Nije dozvoljeno" };

    // Provjera postoje li narudžbe za ovaj event
    // (Opcionalno: Možda ne želiš brisati event ako su ljudi već kupili karte)
    const existingOrders = await Order.findOne({ "orderItems.event": eventId });
    if (existingOrders) {
      return { error: "Ne možete obrisati događaj za koji postoje narudžbe!" };
    }

    await EventModel.findByIdAndDelete(eventId);
    
    revalidatePath("/admin/eventlist");
    revalidatePath("/"); // Osvježi i naslovnu
    return { success: true };
  } catch (error) {
    return { error: "Greška pri brisanju događaja" };
  }
}