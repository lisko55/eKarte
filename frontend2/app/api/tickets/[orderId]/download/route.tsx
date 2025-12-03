import { NextRequest, NextResponse } from "next/server";
import { getMyOrderById } from "@/actions/order-actions";
import { renderToStream } from "@react-pdf/renderer";
import { TicketPDF } from "@/components/pdf/ticketPDF";
import QRCode from "qrcode";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const order = await getMyOrderById(orderId);

    if (!orderId) {
      return new NextResponse("Narudžba nije pronađena", { status: 404 });
    }

    // Generiranje podataka za PDF (isto kao za mail)
    const ticketData = [];
    for (const item of order.orderItems) {
      for (let i = 0; i < item.quantity; i++) {
        const uniqueTicketId = `${order._id}-${item._id}-${i}`;
        const qrCodeDataUrl = await QRCode.toDataURL(uniqueTicketId);

        ticketData.push({
          eventName: item.name.split(" - ")[0],
          ticketType: item.name.split(" - ")[1] || "Standard",
          price: item.price,
          qrCodeDataUrl,
          uniqueId: uniqueTicketId,
        });
      }
    }

    // Generiranje PDF Streama
    const stream = await renderToStream(
      <TicketPDF tickets={ticketData} orderId={orderId} />
    );

    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="ulaznice-${orderId.substring(
          0,
          8
        )}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF Error:", error);
    return new NextResponse("Greška pri generiranju PDF-a", { status: 500 });
  }
}
