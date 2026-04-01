"use client";

import { useEffect, useState, useRef } from "react";
import {
  getMyScanners,
  createScanner,
  deleteScanner,
} from "@/actions/scanner-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Trash2,
  Copy,
  Search,
  UserPlus,
  ShieldCheck,
  Loader2,
  QrCode,
} from "lucide-react";
import { toast } from "sonner"; // Koristimo naš postojeći, ljepši toast sistem
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ScannersPage() {
  const [scanners, setScanners] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  // ================= LOAD =================
  const loadScanners = async () => {
    setLoading(true);
    const data = await getMyScanners();
    setScanners(data || []);
    setFiltered(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadScanners();
  }, []);

  // ================= FILTER =================
  useEffect(() => {
    const f = scanners.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()),
    );
    setFiltered(f);
  }, [search, scanners]);

  // ================= CREATE (OPTIMISTIC) =================
  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);

    const formData = new FormData(e.currentTarget);
    const tempId = Date.now().toString();

    const newScanner = {
      _id: tempId,
      name: formData.get("name"),
      email: formData.get("email"),
    };

    // Optimistic add
    setScanners((prev) => [newScanner, ...prev]);

    const res = await createScanner(formData);

    if (res?.error) {
      setScanners((prev) => prev.filter((s) => s._id !== tempId));
      toast.error(res.error);
      setFormLoading(false);
      return;
    }

    formRef.current?.reset();
    await loadScanners();

    toast.success("Skener uspješno kreiran!");
    setFormLoading(false);
  };

  // ================= DELETE =================
  const handleDelete = async () => {
    if (!confirmId) return;

    const backup = scanners;
    setScanners((prev) => prev.filter((s) => s._id !== confirmId));

    const res = await deleteScanner(confirmId);

    if (res?.error) {
      setScanners(backup);
      toast.error(res.error);
      setConfirmId(null);
      return;
    }

    setConfirmId(null);
    toast.success("Skener obrisan.");
  };

  // ================= COPY =================
  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast.info("Email kopiran u međuspremnik!");
  };

  const total = scanners.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Obezbjeđenje (Skeneri)
          </h1>
          <p className="text-muted-foreground mt-1">
            Kreirajte radnike koji će skenirati ulaznice na vratima.
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border shadow-sm text-sm">
          Ukupno radnika:{" "}
          <span className="font-bold text-blue-600 text-lg ml-2">{total}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* FORM (Lijeva strana) */}
        <div className="md:col-span-4">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserPlus className="w-5 h-5 text-blue-600" />
                Dodaj Skenera
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form ref={formRef} onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Ime radnika ili ulaza
                  </label>
                  <Input name="name" placeholder="npr. Ulaz Zapad" required />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Email za prijavu
                  </label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="zapad@klub.ba"
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Možete koristiti izmišljen email, služi samo za prijavu u
                    sistem.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Lozinka</label>
                  <Input
                    name="password"
                    type="text"
                    placeholder="npr. ulaz123"
                    required
                  />
                </div>

                <Button
                  disabled={formLoading}
                  className="w-full bg-slate-900 hover:bg-slate-800 mt-2"
                >
                  {formLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4 mr-2" />
                  )}
                  {formLoading ? "Kreiranje..." : "Kreiraj nalog"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* LIST (Desna strana) */}
        <div className="md:col-span-8 space-y-4">
          {/* SEARCH BAR */}
          <div className="relative w-full shadow-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pretraži radnike po imenu ili emailu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 bg-white"
            />
          </div>

          <Card className="shadow-sm border-slate-200 overflow-hidden p-0">
            {/* ZAGLAVLJE: Uklonjen svaki margin/padding koji ga odvaja od rubova */}
            <div className="bg-[#0f172a] text-white px-6 py-4 flex items-center gap-2 m-0 w-full rounded-t-lg">
              <ShieldCheck className="w-5 h-5" />
              <h2 className="font-semibold">Aktivni Nalozi</h2>
            </div>

            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 bg-slate-50">
                  <p className="text-slate-500 font-medium">
                    Nema kreiranih naloga za skeniranje.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filtered.map((s) => (
                    <div
                      key={s._id}
                      className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-bold text-slate-800 text-base">
                            {s.name}
                          </p>
                          <p className="text-sm text-slate-500 font-mono mt-0.5">
                            {s.email}
                          </p>
                        </div>

                        {/* --- NOVO: BEDŽ SA STATISTIKOM --- */}
                        <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                          <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-xs font-bold text-emerald-700">
                            Skenirao: {s.scanCount || 0}
                          </span>
                        </div>
                        {/* -------------------------------- */}
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyEmail(s.email)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          title="Kopiraj email"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmId(s._id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Obriši"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SHADCN ALERT DIALOG UMJESTO OBIČNOG MODALA */}
      <AlertDialog
        open={!!confirmId}
        onOpenChange={(open) => !open && setConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Brisanje naloga</AlertDialogTitle>
            <AlertDialogDescription>
              Jeste li sigurni da želite obrisati ovog radnika? On više neće
              moći pristupiti skeneru na ulazu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Odustani</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Da, obriši
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
