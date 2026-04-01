"use client";

import { useEffect, useState } from "react";
import { getAllPayoutRequests, resolvePayout } from "@/actions/payout-actions"; // Naše server akcije
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Banknote,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // Prati koji se zahtjev trenutno obrađuje
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  // ================= FETCH =================
  const fetchPayouts = async () => {
    setLoading(true);
    // Koristimo Server Action umjesto fetch API-ja
    const data = await getAllPayoutRequests("all");
    setPayouts(data || []);
    setFiltered(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  // ================= FILTER =================
  useEffect(() => {
    let temp = payouts;

    if (search) {
      temp = temp.filter(
        (p) =>
          `${p.user?.name} ${p.user?.lastName}`
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          p.iban.toLowerCase().includes(search.toLowerCase()) ||
          p._id.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (status !== "all") {
      temp = temp.filter((p) => p.status === status);
    }

    setFiltered(temp);
  }, [search, status, payouts]);

  // ================= AKCIJE (Odobri / Odbij) =================
  const handleResolve = async (id: string, action: "approve" | "reject") => {
    if (
      !confirm(
        `Jeste li sigurni da želite ${action === "approve" ? "ODOBRITI" : "ODBITI"} ovu isplatu?`,
      )
    )
      return;

    setActionLoading(id);
    const res = await resolvePayout(id, action);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(
        `Isplata uspješno ${action === "approve" ? "odobrena" : "odbijena"}.`,
      );
      fetchPayouts(); // Osvježi listu
    }
    setActionLoading(null);
  };

  // ================= STATS =================
  const total = payouts.reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payouts
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);
  const completedAmount = payouts
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  // ================= UI =================
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Banknote className="w-8 h-8 text-emerald-600" /> Payout Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Upravljajte zahtjevima za isplatu korisnika i organizatora.
          </p>
        </div>
      </div>

      {/* STATS KARTICE */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">
              Ukupno zatraženo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              {total.toFixed(2)} KM
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-amber-700">
              Na čekanju (Za isplatiti)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600">
              {pendingAmount.toFixed(2)} KM
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-emerald-200 bg-emerald-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-emerald-700">
              Uspješno isplaćeno
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-600">
              {completedAmount.toFixed(2)} KM
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FILTER BAR */}
      <Card className="p-4 shadow-sm border-slate-200 flex flex-col md:flex-row gap-4 items-center bg-white">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Traži po imenu, IBAN-u ili ID-u..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-50"
          />
        </div>

        <div className="w-full md:w-48">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="bg-slate-50">
              <SelectValue placeholder="Svi statusi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Svi statusi</SelectItem>
              <SelectItem value="pending">Na čekanju</SelectItem>
              <SelectItem value="completed">Završeno</SelectItem>
              <SelectItem value="rejected">Odbijeno</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* TABELA */}
      <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>ID Zahtjeva</TableHead>
                <TableHead>Partner</TableHead>
                <TableHead>IBAN Račun</TableHead>
                <TableHead>Iznos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead className="text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-slate-500"
                  >
                    Nema zahtjeva za isplatu.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => (
                  <TableRow
                    key={p._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <TableCell className="font-mono text-xs text-slate-400">
                      {p._id.substring(0, 8)}...
                    </TableCell>

                    <TableCell>
                      <div className="font-medium text-slate-900">
                        {p.user?.name} {p.user?.lastName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {p.user?.email}
                      </div>
                    </TableCell>

                    <TableCell className="font-mono text-sm">
                      {p.iban}
                    </TableCell>

                    <TableCell className="font-bold text-slate-900">
                      {p.amount.toFixed(2)} KM
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          p.status === "completed"
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                            : p.status === "pending"
                              ? "bg-amber-100 text-amber-700 border-amber-200"
                              : "bg-red-100 text-red-700 border-red-200"
                        }
                      >
                        {p.status === "pending" && (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        {p.status === "completed" && (
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                        )}
                        {p.status === "rejected" && (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {p.status.toUpperCase()}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-sm text-slate-500">
                      {new Date(p.createdAt).toLocaleDateString("bs-BA")}
                    </TableCell>

                    <TableCell className="text-right">
                      {/* AKCIJE: Prikazuju se samo ako je status "pending" */}
                      {p.status === "pending" && (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 h-8"
                            disabled={actionLoading === p._id}
                            onClick={() => handleResolve(p._id, "approve")}
                          >
                            {actionLoading === p._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Odobri"
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8"
                            disabled={actionLoading === p._id}
                            onClick={() => handleResolve(p._id, "reject")}
                          >
                            Odbij
                          </Button>
                        </div>
                      )}
                      {p.status !== "pending" && (
                        <span className="text-xs text-slate-400">Obrađeno</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
