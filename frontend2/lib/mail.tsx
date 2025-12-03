import nodemailer from "nodemailer";
import { renderToBuffer } from "@react-pdf/renderer";
import { TicketPDF } from "@/components/pdf/ticketPDF"; // Provjeri ime fajla!
import React from "react";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

// --- 1. VERIFIKACIJA EMAILA ---
export async function sendVerificationEmail(email: string, token: string) {
  const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: '"eKarte" <noreply@ekarte.com>',
    to: email,
    subject: "Potvrdite svoju email adresu",
    html: `
      <h1>Dobrodošli na eKarte!</h1>
      <p>Kliknite na donji link da biste potvrdili svoj račun:</p>
      <a href="${confirmLink}">Potvrdi Email</a>
      <p>Link vrijedi 24 sata.</p>
    `,
  });
}

// --- 2. RESET LOZINKE ---
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${token}`;

  await transporter.sendMail({
    from: '"eKarte" <noreply@ekarte.com>',
    to: email,
    subject: "Resetiranje lozinke",
    html: `
      <h1>Zaboravili ste lozinku?</h1>
      <p>Kliknite ovdje za postavljanje nove lozinke:</p>
      <a href="${resetLink}">Resetiraj Lozinku</a>
      <p>Ako ovo niste zatražili, ignorirajte ovaj email.</p>
    `,
  });
}

// --- 3. SLANJE ULAZNICA (PDF) ---
interface TicketEmailProps {
  customerName: string;
  customerEmail: string;
  orderId: string;
  tickets: {
    eventName: string;
    ticketType: string;
    price: number;
    qrCodeDataUrl: string;
    uniqueId: string;
  }[];
  totalPrice: number;
}

export async function sendTicketEmail({
  customerName,
  customerEmail,
  orderId,
  tickets,
  totalPrice,
}: TicketEmailProps) {
  // Generiraj PDF Buffer
  const pdfBuffer = await renderToBuffer(
    <TicketPDF tickets={tickets} orderId={orderId} />
  );

  const htmlBody = `
    <div style="font-family: sans-serif; color: #333;">
      <h1>Hvala na kupovini, ${customerName}!</h1>
      <p>Vaša narudžba <strong>#${orderId}</strong> je uspješno obrađena.</p>
      <p><strong>Ukupno plaćeno: ${totalPrice} KM</strong></p>
      <br/>
      <p style="font-size: 16px;"><strong>📎 Vaše ulaznice se nalaze u PDF privitku ovog maila.</strong></p>
      <p>Molimo preuzmite PDF i pokažite QR kodove na ulazu.</p>
    </div>
  `;

  await transporter.sendMail({
    from: '"eKarte" <noreply@ekarte.com>',
    to: customerEmail,
    subject: `Vaše ulaznice (Narudžba #${orderId.substring(0, 8)})`,
    html: htmlBody,
    attachments: [
      {
        filename: `ulaznice-${orderId.substring(0, 8)}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
}
