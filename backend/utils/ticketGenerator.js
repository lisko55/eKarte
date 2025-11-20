const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");

const generateTicketPDF = async (item, order) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A6", margin: 30 });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .text("eKarte", { align: "center" });
      doc.moveDown();

      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text(item.name, { align: "center" });
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(`Datum: ${new Date(order.paidAt).toLocaleDateString("hr-HR")}`, {
          align: "center",
        });
      doc.moveDown(2);

      doc.fontSize(10).text(`Narudžba ID: ${order._id}`);
      doc.text(`Ulaznica ID: ${item._id}`);
      doc.moveDown();

      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(`Cijena: ${item.price.toFixed(2)} BAM`);
      doc.moveDown(2);

      const qrCodeData = JSON.stringify({
        orderId: order._id,
        itemId: item._id,
        eventName: item.name,
      });
      const qrCodeImage = await QRCode.toDataURL(qrCodeData);

      const imageBuffer = Buffer.from(qrCodeImage.split(",")[1], "base64");
      doc.image(imageBuffer, {
        fit: [150, 150],
        align: "center",
        valign: "center",
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateTicketPDF };
