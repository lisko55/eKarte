"use client";

import { useState } from "react";
import { submitPartnerRequest } from "@/actions/partner-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Building2,
  User,
  Mail,
  Phone,
  CheckCircle,
  TrendingUp,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import Link from "next/link";

export default function PostaniPartnerPage() {
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await submitPartnerRequest(formData);

    if (result.error) {
      toast.error(result.error);
    } else if (result.success) {
      toast.success("Zahtjev uspješno poslan!");
      setIsSubmitted(true);
    }

    setLoading(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="bg-emerald-100 p-6 rounded-full mb-6 ring-8 ring-emerald-50">
          <CheckCircle className="w-16 h-16 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4 text-center">
          Hvala na interesovanju!
        </h1>
        <p className="text-slate-500 text-center max-w-md mb-8 text-base">
          Vaš zahtjev za partnerstvo je uspješno zaprimljen. Naš tim će
          pregledati podatke i kontaktirati vas u najkraćem mogućem roku.
        </p>
        <Button
          asChild
          className="bg-slate-900 hover:bg-slate-800 h-12 px-8 text-base rounded-full"
        >
          <Link href="/">Povratak na naslovnu</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-20 relative overflow-hidden">
      {/* Suptilni dekorativni gradijent u pozadini */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[450px] h-[450px] bg-blue-100/40 rounded-full blur-[90px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[550px] h-[550px] bg-purple-100/40 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container max-w-6xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* LIJEVA STRANA - PRODAJNI PITCH */}
          <div className="space-y-8">
            <div>
              <BadgeText>B2B Partnerstvo</BadgeText>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mt-5 leading-tight">
                Prodajte više ulaznica, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  bez stresa.
                </span>
              </h1>
              <p className="text-lg text-slate-600 mt-5 leading-relaxed max-w-lg">
                Pridružite se eKarte platformi. Iskoristite napredni sistem za
                prodaju, dinamičke QR kodove protiv prevara i analitiku u
                realnom vremenu.
              </p>
            </div>

            <div className="space-y-6 pt-4">
              <FeatureItem
                icon={TrendingUp}
                title="Povećajte prodaju"
                desc="Pristupite hiljadama korisnika koji traže događaje u vašem gradu."
                colorClass="text-blue-600"
                bgClass="bg-blue-100"
              />
              <FeatureItem
                icon={ShieldCheck}
                title="Sigurnost na prvom mjestu"
                desc="Naši rotirajući QR kodovi čine kopiranje ulaznica nemogućim."
                colorClass="text-emerald-600"
                bgClass="bg-emerald-100"
              />
              <FeatureItem
                icon={Ticket}
                title="Organizatorski Panel"
                desc="Pratite prodaju, cijene i skenirajte ulaznice sa svog telefona."
                colorClass="text-purple-600"
                bgClass="bg-purple-100"
              />
            </div>
          </div>

          {/* DESNA STRANA - FORMA */}
          <div className="relative max-w-lg mx-auto w-full">
            {/* DODANO: p-0 i border-none da spriječimo bilo kakav bijeli razmak */}
            <Card className="shadow-2xl border-0 p-0 ring-1 ring-slate-200/50 rounded-[1.5rem] overflow-hidden bg-white/95 backdrop-blur-xl">
              {/* Header Forme - DODANO: rounded-t-[1.5rem] i m-0 */}
              <div className="bg-slate-900 px-8 py-8 relative overflow-hidden rounded-t-[1.5rem] m-0 w-full">
                <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/20 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2"></div>
                <h2 className="text-2xl font-bold text-white relative z-10">
                  Zatražite pristup
                </h2>
                <p className="text-slate-300 mt-1.5 relative z-10 text-sm">
                  Popunite formu i naš tim će vam odobriti račun.
                </p>
              </div>

              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Naziv organizacije <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-3 h-[18px] w-[18px] text-slate-400" />
                      <Input
                        name="organizationName"
                        required
                        className="pl-10 h-11 text-base bg-slate-50/50 rounded-lg"
                        placeholder="npr. Event Agency d.o.o."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        Kontakt osoba <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3 h-[18px] w-[18px] text-slate-400" />
                        <Input
                          name="contactName"
                          required
                          className="pl-10 h-11 text-base bg-slate-50/50 rounded-lg"
                          placeholder="Ime i prezime"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        Telefon <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3 h-[18px] w-[18px] text-slate-400" />
                        <Input
                          type="tel"
                          name="phone"
                          required
                          className="pl-10 h-11 text-base bg-slate-50/50 rounded-lg"
                          placeholder="+387..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Poslovni Email <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 h-[18px] w-[18px] text-slate-400" />
                      <Input
                        type="email"
                        name="email"
                        required
                        className="pl-10 h-11 text-base bg-slate-50/50 rounded-lg"
                        placeholder="info@vasakompanija.ba"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Dodatna poruka
                    </Label>
                    <Textarea
                      name="message"
                      className="min-h-[100px] text-base bg-slate-50/50 rounded-lg resize-none p-3.5"
                      placeholder="Ukratko nam opišite kakve događaje planirate organizovati..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 text-base rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold shadow-md transition-all mt-4"
                  >
                    {loading ? "Slanje zahtjeva..." : "Pošalji zahtjev"}
                  </Button>

                  <p className="text-xs text-center text-slate-500 mt-4">
                    Slanjem ovog zahtjeva pristajete na naše{" "}
                    <Link href="#" className="underline hover:text-slate-800">
                      Uslove korištenja
                    </Link>
                    .
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Pomoćne komponente
function BadgeText({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[11px] uppercase tracking-widest border border-indigo-100">
      {children}
    </span>
  );
}

function FeatureItem({ icon: Icon, title, desc, colorClass, bgClass }: any) {
  return (
    <div className="flex gap-4 items-start group">
      <div
        className={`p-3 rounded-2xl shadow-sm border border-white/50 flex-shrink-0 transition-transform group-hover:scale-105 ${bgClass}`}
      >
        <Icon className={`w-6 h-6 ${colorClass}`} />
      </div>
      <div>
        <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
        <p className="text-slate-600 text-[15px] mt-1 leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}
