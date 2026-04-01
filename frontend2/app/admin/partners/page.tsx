import {
  getPartnerRequests,
  approvePartnerRequest,
  rejectPartnerRequest,
} from "@/actions/partner-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Building2, Phone, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PartnersPage() {
  const requests = await getPartnerRequests();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">B2B Partner Zahtjevi</h1>
        <p className="text-muted-foreground text-sm">
          Pregledajte i odobrite organizatore koji žele prodavati ulaznice.
        </p>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organizacija</TableHead>
                <TableHead>Kontakt Osoba</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Akcija</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req: any) => (
                <TableRow key={req._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">
                          {req.organizationName}
                        </p>
                        {req.taxId && (
                          <p className="text-xs text-slate-500">
                            JIB: {req.taxId}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <p className="font-medium text-sm">{req.contactName}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Mail className="w-3 h-3" /> {req.email}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Phone className="w-3 h-3" /> {req.phone}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-sm text-slate-500">
                    {new Date(req.createdAt).toLocaleDateString("bs-BA")}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        req.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : req.status === "approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                      }
                    >
                      {req.status === "pending"
                        ? "Na Čekanju"
                        : req.status === "approved"
                          ? "Odobreno"
                          : "Odbijeno"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    {req.status === "pending" && (
                      <div className="flex justify-end gap-2">
                        {/* ODBIJ */}
                        <form
                          action={async () => {
                            "use server";
                            await rejectPartnerRequest(req._id);
                          }}
                        >
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Odbij"
                          >
                            <XCircle className="w-5 h-5" />
                          </Button>
                        </form>

                        {/* ODOBRI */}
                        <form
                          action={async () => {
                            "use server";
                            await approvePartnerRequest(req._id);
                          }}
                        >
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" /> Odobri
                          </Button>
                        </form>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {requests.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              Nema novih zahtjeva za partnerstvo.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
