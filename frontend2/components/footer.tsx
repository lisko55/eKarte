"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  MapPin,
  Phone,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Footer() {
  const pathname = usePathname();

  // Ne prikazuj footer na admin stranicama
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-[#0f172a] text-slate-300 border-t border-slate-800">
      <div className="container mx-auto px-4 py-16">
        {/* GORNJI DIO FOOTERA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* 1. O NAMA */}
          <div className="space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-white font-bold text-xl"
            >
              <Ticket className="w-6 h-6 text-blue-500" />
              <span>TvojLogo</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Vodeća platforma za sigurnu kupovinu i preprodaju ulaznica u
              regiji. Garantujemo validnost svake ulaznice putem naše inovativne
              tehnologije.
            </p>
            <div className="flex gap-4 pt-2">
              <SocialIcon icon={Facebook} href="#" />
              <SocialIcon icon={Instagram} href="#" />
              <SocialIcon icon={Twitter} href="#" />
            </div>
          </div>

          {/* 2. BRZI LINKOVI */}
          <div>
            <h3 className="text-white font-semibold mb-6">Istraži</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <FooterLink href="/?category=Muzika">Koncerti</FooterLink>
              </li>
              <li>
                <FooterLink href="/?category=Sport">Sport</FooterLink>
              </li>
              <li>
                <FooterLink href="/?category=Pozorište">
                  Kultura & Pozorište
                </FooterLink>
              </li>
              <li>
                <FooterLink href="/my-tickets">Moje Ulaznice</FooterLink>
              </li>
              <li>
                <FooterLink href="/my-tickets">Prodaj Ulaznicu</FooterLink>
              </li>
            </ul>
          </div>

          {/* 3. PODRŠKA */}
          <div>
            <h3 className="text-white font-semibold mb-6">Podrška</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <FooterLink href="#">Centar za pomoć</FooterLink>
              </li>
              <li>
                <FooterLink href="#">Kako funkcionira Resale?</FooterLink>
              </li>
              <li>
                <FooterLink href="#">Povrat novca</FooterLink>
              </li>
              <li>
                <FooterLink href="#">Uvjeti korištenja</FooterLink>
              </li>
              <li>
                <FooterLink href="#">Politika privatnosti</FooterLink>
              </li>
            </ul>
          </div>

          {/* 4. NEWSLETTER */}
          <div>
            <h3 className="text-white font-semibold mb-6">Budite u toku</h3>
            <p className="text-sm text-slate-400 mb-4">
              Prijavite se za najnovije koncerte i ekskluzivne popuste.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Vaš email"
                className="bg-slate-800 border-none text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-blue-500"
              />
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Mail className="w-4 h-4" />
              </Button>
            </div>
            <div className="mt-6 space-y-2 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>Zenica, Bosna i Hercegovina</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-500" />
                <span>+387 61 123 456</span>
              </div>
            </div>
          </div>
        </div>

        {/* DONJI DIO (COPYRIGHT) */}
        <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} TvojLogo. Sva prava pridržana.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Cookies Settings
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Pomoćne komponente za čišći kod
function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="hover:text-blue-400 transition-colors block w-fit"
    >
      {children}
    </Link>
  );
}

function SocialIcon({ icon: Icon, href }: any) {
  return (
    <Link
      href={href}
      className="bg-slate-800 p-2 rounded-full hover:bg-blue-600 hover:text-white transition-all text-slate-400"
    >
      <Icon className="w-5 h-5" />
    </Link>
  );
}
