import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Ticket from "@/models/ticket";
import EventModel from "@/models/event";
import { getSession } from "@/lib/session";
import * as xlsx from "xlsx"; // <--- NOVI IMPORT

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const session = await getSession();

    if (!session || (!session.isAdmin && session.role !== "organizer")) {
      return new NextResponse("Nije dozvoljeno", { status: 403 });
    }

    const resolvedParams = await params;
    const eventId = resolvedParams.id;

    const event = await EventModel.findById(eventId);
    if (!event)
      return new NextResponse("Događaj nije pronađen", { status: 404 });

    if (
      session.role === "organizer" &&
      event.organizer?.toString() !== session.userId
    ) {
      return new NextResponse("Zabranjen pristup", { status: 403 });
    }

    const tickets = await Ticket.find({
      event: eventId,
      status: { $in: ["valid", "used"] },
    })
      .populate("owner", "name lastName email phone")
      .sort({ createdAt: -1 })
      .lean();

    // 1. Priprema podataka za Excel (Pravi objekti)
    const exportData = tickets.map((t: any) => ({
      "ID Ulaznice": t._id.toString(),
      "Ime i Prezime": t.owner
        ? `${t.owner.name} ${t.owner.lastName}`
        : "Nepoznato",
      Email: t.owner?.email || "N/A",
      Telefon: t.owner?.phone || "N/A",
      "Tip Ulaznice": t.ticketType.name,
      "Cijena (KM)": t.purchasePrice || t.ticketType.price || 0,
      Status: t.status === "used" ? "UŠAO" : "NIJE UŠAO",
      "Vrijeme Kupovine": t.createdAt
        ? new Date(t.createdAt).toLocaleString("bs-BA")
        : "N/A",
      "Vrijeme Ulaska": t.usedAt
        ? new Date(t.usedAt).toLocaleString("bs-BA")
        : "N/A",
    }));

    // 2. Kreiranje Excel radne sveske (Workbook) i lista (Worksheet)
    const worksheet = xlsx.utils.json_to_sheet(exportData);

    // Malo uljepšavanje: podešavanje širine kolona
    worksheet["!cols"] = [
      { wch: 25 }, // ID
      { wch: 25 }, // Ime
      { wch: 30 }, // Email
      { wch: 15 }, // Telefon
      { wch: 20 }, // Tip
      { wch: 12 }, // Cijena
      { wch: 15 }, // Status
      { wch: 22 }, // Vrijeme kupovine
      { wch: 22 }, // Vrijeme ulaska
    ];

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Spisak Gostiju");

    // 3. Pretvaranje u Buffer
    const excelBuffer = xlsx.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    // 4. Slanje pravog .xlsx fajla
    const fileName = `spisak-${event.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.xlsx`;

    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Greška pri eksportu:", error);
    return new NextResponse("Greška na serveru", { status: 500 });
  }
}
