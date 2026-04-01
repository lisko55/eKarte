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
  isFreeTicket?: boolean;
}

export async function sendTicketEmail({
  customerName,
  customerEmail,
  orderId,
  tickets,
  totalPrice,
  isFreeTicket = false,
}: TicketEmailProps) {
  // Generiraj PDF Buffer
  const pdfBuffer = await renderToBuffer(
    <TicketPDF tickets={tickets} orderId={orderId} />,
  );

  // --- LOGIKA ZA TEKST MAILA (Gratis vs Kupljeno) ---
  const subjectText = isFreeTicket
    ? `Vaše gratis ulaznice (Narudžba #${orderId.substring(0, 8)})`
    : `Vaše ulaznice (Narudžba #${orderId.substring(0, 8)})`;

  const headingText = isFreeTicket
    ? `Evo vaših ulaznica, ${customerName}!`
    : `Hvala na kupovini, ${customerName}!`;

  const descriptionText = isFreeTicket
    ? `Vaše gratis ulaznice za narudžbu <strong>#${orderId}</strong> su spremne.`
    : `Vaša narudžba <strong>#${orderId}</strong> je uspješno obrađena.`;

  const priceBoxHtml = isFreeTicket
    ? `<div style="background-color: #0f172a; color: white; padding: 15px; border-radius: 8px; text-align: center; margin-top: 20px;">
         <p style="margin: 0; font-size: 18px;"><strong>GRATIS ULAZNICA</strong></p>
       </div>`
    : `<div style="background-color: #0f172a; color: white; padding: 15px; border-radius: 8px; text-align: center; margin-top: 20px;">
         <p style="margin: 0; font-size: 18px;">Ukupno plaćeno: <strong>${totalPrice} KM</strong></p>
       </div>`;

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
// --- 4. EMAIL ZA NOVOG ORGANIZATORA ---
export async function sendOrganizerWelcomeEmail(
  email: string,
  orgName: string,
  plainPassword: string,
) {
  const loginLink = `${process.env.NEXT_PUBLIC_APP_URL}/login`;

  await transporter.sendMail({
    from: '"eKarte B2B" <noreply@ekarte.com>',
    to: email,
    subject: "Vaš organizatorski račun je odobren! 🎉",
    html: `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 30px; border-radius: 12px;">
        <h1 style="color: #0f172a;">Dobrodošli, ${orgName}!</h1>
        <p>Vaš zahtjev za partnerstvo sa eKarte platformom je <strong>odobren</strong>.</p>
        <p>Sada možete objavljivati događaje, pratiti prodaju i skenirati ulaznice na ulazu.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Vaši pristupni podaci:</strong></p>
            <p style="margin: 0 0 5px 0;">Email: <strong>${email}</strong></p>
            <p style="margin: 0;">Privremena lozinka: <strong style="font-family: monospace; font-size: 18px; color: #2563eb;">${plainPassword}</strong></p>
        </div>

        <p style="font-size: 14px; color: #64748b;">* Preporučujemo da promijenite lozinku u postavkama profila nakon prve prijave.</p>

        <a href="${loginLink}" style="display: inline-block; background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: bold;">
            Prijavite se na Panel
        </a>
      </div>
    `,
  });
}
