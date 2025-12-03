"use server";

import connectDB from "@/lib/db";
import Order from "@/models/order";
import EventModel from "@/models/event";
import Ticket from "@/models/ticket";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import QRCode from "qrcode";
import { sendTicketEmail } from "@/lib/mail";
import crypto from "crypto";
import User from "@/models/user";

// Pomoćna funkcija za generiranje tajnog ključa (Hex string)
function generateSecret() {
  return crypto.randomBytes(20).toString("hex");
}

interface CreateOrderParams {
  items: any[];
  totalPrice: number;
  paymentResult?: any;
  useCredit?: boolean;
}

// 1. KREIRANJE NARUDŽBE
// --- 1. KREIRANJE NARUDŽBE I ULAZNICA ---
export async function createOrder({
  items,
  totalPrice,
  paymentResult,
  useCredit,
}: CreateOrderParams) {
  try {
    await connectDB();
    const session = await getSession();

    if (!session || !session.userId) {
      return { success: false, error: "Morate biti prijavljeni." };
    }

    if (!items || items.length === 0) {
      throw new Error("Nema stavki u narudžbi");
    }

    // --- LOGIKA ZA WALLET (SKIDANJE NOVCA KUPCU) ---
    if (useCredit) {
      const user = await User.findById(session.userId);
      if (user && user.balance > 0) {
        const amountToDeduct = Math.min(user.balance, totalPrice);
        user.balance -= amountToDeduct;
        await user.save();
        console.log(
          `WALLET: Skinuto ${amountToDeduct} KM kupcu ${session.userId}`
        );
      }
    }

    // A) KREIRANJE GLAVNE NARUDŽBE
    const newOrder = await Order.create({
      user: session.userId,
      orderItems: items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
        event: item.eventID,
        ticketType: item.isResale ? item._id : item._id,
      })),
      paymentMethod: "Stripe",
      paymentResult: paymentResult || {
        id: "SIM_" + Date.now(),
        status: "completed",
        email_address: session.email,
        update_time: new Date().toISOString(),
      },
      totalPrice: totalPrice,
      isPaid: true,
      paidAt: new Date(),
    });

    // B) PROCESIRANJE STAVKI
    for (const item of items) {
      // === SCENARIJ A: RESALE KARTA (PRIJENOS) ===
      if (item.isResale) {
        console.log(">>> OBRADA RESALE KARTE:", item._id);

        const ticketId = item._id;

        // 1. Nađi kartu
        const ticket = await Ticket.findById(ticketId);

        if (!ticket) {
          console.error("CRITICAL: Resale karta nije nađena u bazi:", ticketId);
          continue;
        }

        // 2. ISPLATA STAROG VLASNIKA (PRODAVAČA)
        const sellerId = ticket.owner;
        const payoutAmount = Number(item.price); // Osiguraj da je broj

        console.log(
          `>>> ISPLATA: Šaljem ${payoutAmount} KM korisniku ${sellerId}`
        );

        const sellerUpdate = await User.findByIdAndUpdate(
          sellerId,
          { $inc: { balance: payoutAmount } },
          { new: true } // Vrati ažurirani dokument da vidimo novi balans
        );

        console.log(
          `>>> ISPLATA USPJEŠNA. Novi balans prodavača: ${sellerUpdate?.balance} KM`
        );

        // 3. TRANSFER VLASNIŠTVA
        const newSecret = generateSecret();

        await Ticket.findByIdAndUpdate(ticketId, {
          $set: {
            owner: session.userId,
            secretKey: newSecret,
            status: "valid",
            isListed: false,
            resalePrice: null,
            purchasePrice: payoutAmount,
          },
          $push: {
            history: {
              action: "transferred",
              fromUser: sellerId,
              toUser: session.userId,
              price: payoutAmount,
              date: new Date(),
            },
          },
        });

        revalidatePath(`/ticket/${ticketId}`);
      }

      // === SCENARIJ B: NOVA KARTA ===
      else {
        // ... (Logika za nove karte - ostaje ista)
        await EventModel.updateOne(
          { _id: item.eventID, "ticketTypes._id": item._id },
          { $inc: { "ticketTypes.$.quantity": -item.quantity } }
        );

        for (let i = 0; i < item.quantity; i++) {
          const secret = generateSecret();
          await Ticket.create({
            event: item.eventID,
            ticketType: {
              _id: item._id,
              name: item.name.includes(" - ")
                ? item.name.split(" - ")[1]
                : "Standard",
              price: item.price,
            },
            owner: session.userId,
            originalOwner: session.userId,
            purchaseOrder: newOrder._id,
            purchasePrice: item.price,
            secretKey: secret,
            status: "valid",
            history: [
              {
                action: "created",
                fromUser: session.userId,
                toUser: session.userId,
                price: item.price,
              },
            ],
          });
        }
      }
    }

    // 3. SLANJE MAILA
    try {
      const ticketDataForEmail = [];

      for (const item of items) {
        for (let i = 0; i < item.quantity; i++) {
          const uniqueTicketId = `${newOrder._id}-${item._id}-${i}`;
          const qrCodeDataUrl = await QRCode.toDataURL(uniqueTicketId);

          ticketDataForEmail.push({
            eventName: item.name.split(" - ")[0],
            ticketType: item.name.split(" - ")[1] || "Standard",
            price: item.price,
            qrCodeDataUrl,
            uniqueId: uniqueTicketId,
          });
        }
      }

      await sendTicketEmail({
        customerName: (session.name as string) || "Kupac",
        customerEmail: session.email as string,
        orderId: newOrder._id.toString(),
        totalPrice: totalPrice,
        tickets: ticketDataForEmail,
      });
    } catch (emailError) {
      console.error("Greška pri slanju emaila:", emailError);
    }

    // 4. OSVJEŽAVANJE
    revalidatePath("/admin/orders");
    revalidatePath("/my-orders");
    revalidatePath("/my-tickets"); // Bitno za wallet

    // Osvježi sve evente iz narudžbe
    const uniqueEventIds = Array.from(new Set(items.map((i) => i.eventID)));
    for (const eid of uniqueEventIds) {
      revalidatePath(`/event/${eid}`);
    }

    return { success: true, orderId: newOrder._id.toString() };
  } catch (error: any) {
    console.error("Greška pri kreiranju narudžbe:", error);
    return { success: false, error: error.message };
  }
}

// --- 2. DOHVAT MOJIH NARUDŽBI (User View) ---
export async function getMyOrders() {
  try {
    await connectDB();
    const session = await getSession();

    if (!session || !session.userId) return [];

    const orders = await Order.find({ user: session.userId })
      .sort({ createdAt: -1 })
      .lean();

    return orders.map((order: any) => ({
      ...order,
      _id: order._id.toString(),
      user: order.user.toString(),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      paidAt: order.paidAt ? order.paidAt.toISOString() : null,
      orderItems: order.orderItems.map((item: any) => ({
        ...item,
        _id: item._id ? item._id.toString() : null,
        event: item.event ? item.event.toString() : null,
      })),
    }));
  } catch (error) {
    return [];
  }
}

// --- 3. DOHVAT DETALJA JEDNE NARUDŽBE (User View) ---
export async function getMyOrderById(orderId: string) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session || !session.userId) return null;

    // Provjera formata ID-a
    if (!orderId.match(/^[0-9a-fA-F]{24}$/)) return null;

    const order = await Order.findOne({ _id: orderId, user: session.userId })
      .populate("user", "name lastName email")
      .populate({
        path: "orderItems.event",
        model: EventModel,
        select: "title date location image time category",
      })
      .lean();

    if (!order) return null;

    return {
      ...order,
      _id: order._id.toString(),
      totalPrice: order.totalPrice,
      isPaid: order.isPaid,
      createdAt: order.createdAt.toISOString(),
      user: {
        name: order.user.name,
        lastName: order.user.lastName,
        email: order.user.email,
      },
      orderItems: order.orderItems.map((item: any) => ({
        ...item,
        _id: item._id ? item._id.toString() : null,
        event: item.event
          ? {
              _id: item.event._id.toString(),
              title: item.event.title,
              location: item.event.location,
              date: item.event.date ? item.event.date.toISOString() : null,
              time: item.event.time || null,
            }
          : null,
      })),
    };
  } catch (error) {
    return null;
  }
}

// --- 4. DOHVAT SVIH NARUDŽBI (Admin View) ---
export async function getAllOrders(
  page: number = 1,
  query: string = "",
  status: string = "all"
) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session || !session.isAdmin) return { orders: [], totalPages: 0 };

    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    const matchStage: any = {};
    if (status !== "all") {
      matchStage.isPaid = status === "paid";
    }

    const pipeline: any[] = [
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
      { $match: matchStage },
    ];

    if (query) {
      const searchConditions: any[] = [
        { "userDetails.name": { $regex: query, $options: "i" } },
        { "userDetails.email": { $regex: query, $options: "i" } },
        { "userDetails.lastName": { $regex: query, $options: "i" } },
      ];
      // Dodaj pretragu po ID-u ako query liči na ObjectId
      if (query.match(/^[0-9a-fA-F]{24}$/)) {
        // Ovdje koristimo addFields trik za string konverziju ID-a u searchOrdersPreview
        // Ali za glavni list, možemo pokušati direktan match ili ostaviti samo user search
        // Radi jednostavnosti, ovdje pretražujemo samo usere, jer imamo poseban searchOrdersPreview
      }
      pipeline.push({ $match: { $or: searchConditions } });
    }

    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await Order.aggregate(countPipeline);
    const totalOrders = countResult.length > 0 ? countResult[0].total : 0;

    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: pageSize }
    );

    const orders = await Order.aggregate(pipeline);

    return {
      orders: orders.map((order: any) => ({
        _id: order._id.toString(),
        totalPrice: order.totalPrice,
        isPaid: order.isPaid,
        createdAt: order.createdAt.toISOString(),
        user: order.userDetails
          ? {
              name: order.userDetails.name,
              lastName: order.userDetails.lastName,
              email: order.userDetails.email,
            }
          : { name: "Nepoznato", lastName: "", email: "Obrisan" },
        itemsSummary: order.orderItems
          .map((i: any) => `${i.quantity}x ${i.name}`)
          .join(", "),
      })),
      totalPages: Math.ceil(totalOrders / pageSize),
    };
  } catch (error) {
    return { orders: [], totalPages: 0 };
  }
}

// --- 5. ADMIN PRETRAGA (Live Preview) ---
export async function searchOrdersPreview(query: string) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session || !session.isAdmin) return [];
    if (!query) return [];

    const orders = await Order.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          orderIdString: { $toString: "$_id" },
          userName: {
            $concat: ["$userDetails.name", " ", "$userDetails.lastName"],
          },
        },
      },
      {
        $match: {
          $or: [
            { orderIdString: { $regex: query, $options: "i" } },
            { "userDetails.name": { $regex: query, $options: "i" } },
            { "userDetails.lastName": { $regex: query, $options: "i" } },
            { "userDetails.email": { $regex: query, $options: "i" } },
            { userName: { $regex: query, $options: "i" } },
          ],
        },
      },
      { $limit: 5 },
      {
        $project: {
          _id: { $toString: "$_id" },
          totalPrice: 1,
          isPaid: 1,
          userName: 1,
          userEmail: "$userDetails.email",
        },
      },
    ]);

    return orders;
  } catch (error) {
    return [];
  }
}

// --- 6. ADMIN DETALJI NARUDŽBE ---
export async function getAdminOrderById(orderId: string) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session || !session.isAdmin) return null;
    if (!orderId.match(/^[0-9a-fA-F]{24}$/)) return null;

    const order = await Order.findById(orderId)
      .populate("user", "name lastName email phone")
      .lean();

    if (!order) return null;

    return {
      ...order,
      _id: order._id.toString(),
      user: order.user
        ? { ...order.user, _id: order.user._id.toString() }
        : null,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      orderItems: order.orderItems.map((item: any) => ({
        ...item,
        _id: item._id ? item._id.toString() : null,
        event: item.event ? item.event.toString() : null,
      })),
    };
  } catch (error) {
    return null;
  }
}
