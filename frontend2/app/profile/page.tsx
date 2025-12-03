"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/image-upload";
import { updateUserProfile } from "@/actions/auth-actions";
import { getUserBalance } from "@/actions/user-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, User, Mail, Phone, Lock, Save, Wallet } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0); // <--- NOVI STATE

  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    phone: "",
    avatar: "",
    newPassword: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        avatar: user.avatar || "",
      }));

      // --- DOHVATI BALANS ---
      getUserBalance().then((bal) => setBalance(bal));
      // ---------------------
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("lastName", formData.lastName);
    data.append("phone", formData.phone);
    data.append("avatar", formData.avatar);
    if (formData.newPassword) {
      data.append("newPassword", formData.newPassword);
    }

    const result = await updateUserProfile(data);

    if (result?.error) {
      toast.error(result.error);
    } else if (result?.success) {
      toast.success("Profil uspješno ažuriran!");
      const oldData = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const newData = { ...oldData, ...result.user };
      localStorage.setItem("userInfo", JSON.stringify(newData));
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      <div className="container max-w-5xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Moj Profil</h1>
            <p className="text-muted-foreground">
              Upravljajte svojim podacima i financijama.
            </p>
          </div>

          {/* --- NOVA WALLET KARTICA --- */}
          <div className="bg-emerald-600 text-white p-4 rounded-xl shadow-lg flex items-center gap-4 min-w-[250px]">
            <div className="bg-white/20 p-3 rounded-full">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-emerald-100 uppercase font-semibold tracking-wider">
                Moj Kredit
              </p>
              <p className="text-2xl font-bold">{balance.toFixed(2)} KM</p>
            </div>
          </div>
          {/* --------------------------- */}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* LIJEVI STUPAC - KARTICA KORISNIKA */}
            <div className="md:col-span-4 space-y-6">
              <Card className="border-t-4 border-t-primary shadow-sm">
                <CardContent className="pt-6 text-center">
                  <div className="relative inline-block mb-4">
                    <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                      <AvatarImage
                        src={formData.avatar}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-4xl bg-slate-100 text-slate-400">
                        {formData.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <h2 className="text-xl font-bold">
                    {formData.name} {formData.lastName}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    {formData.email}
                  </p>

                  <Separator className="my-4" />

                  <div className="text-left space-y-1">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground">
                      Promijeni sliku
                    </Label>
                    <div className="mt-2 bg-slate-50 rounded-lg border border-dashed border-slate-300 p-1">
                      <ImageUpload
                        value={formData.avatar}
                        onChange={(url) =>
                          setFormData({ ...formData, avatar: url })
                        }
                        onRemove={() =>
                          setFormData({ ...formData, avatar: "" })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* DESNI STUPAC - FORMA */}
            <div className="md:col-span-8 space-y-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Lični Podaci</CardTitle>
                  <CardDescription>
                    Ažurirajte svoje ime, prezime i kontakt.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ime</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          className="pl-9"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Prezime</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          className="pl-9"
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              lastName: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email adresa</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-9 bg-slate-50"
                        value={formData.email}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Broj telefona</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+387..."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Sigurnost</CardTitle>
                  <CardDescription>
                    Promijenite lozinku samo ako je potrebno.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label>Nova Lozinka</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        type="password"
                        placeholder="Unesite novu lozinku..."
                        value={formData.newPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            newPassword: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="min-w-[150px] shadow-md"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Spremanje...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Spremi promjene
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
