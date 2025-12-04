import { getAllUsers, toggleUserRole } from "@/actions/admin-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldOff } from "lucide-react";
import { Pagination } from "@/components/admin/pagination";
import { UserSearch } from "@/components/admin/user-search";
import { UserDeleteButton } from "@/components/admin/user-delete-button"; // <--- OVO JE BITNO
export const dynamic = "force-dynamic";

interface UserListPageProps {
  searchParams: Promise<{
    query?: string;
    page?: string;
  }>;
}

export default async function UserListPage(props: UserListPageProps) {
  const searchParams = await props.searchParams;
  const query = searchParams.query || "";
  const page = Number(searchParams.page) || 1;

  // Dohvaćamo korisnike I rolu trenutno prijavljenog admina
  const { users, totalPages, currentUserRole } = await getAllUsers(query, page);

  const isSuperAdmin = currentUserRole === "superadmin";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Upravljanje Korisnicima</h1>
        <UserSearch />
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Korisnik</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Uloga</TableHead>
                <TableHead>Datum registracije</TableHead>
                <TableHead className="text-right">Opcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user: any) => {
                // --- LOGIKA ZA DOZVOLE ---
                const targetIsSuperAdmin = user.role === "superadmin";
                const targetIsAdmin = user.role === "admin";

                // SuperAdmin može brisati sve osim drugih SuperAdmina
                // Običan Admin može brisati samo Usera (ne može drugog Admina)
                const canDelete =
                  !targetIsSuperAdmin && (isSuperAdmin || !targetIsAdmin);

                return (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="text-base">
                          {user.name} {user.lastName}
                        </span>
                        {user.phone && (
                          <span className="text-xs text-muted-foreground">
                            {user.phone}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.role === "superadmin"
                            ? "bg-purple-600 hover:bg-purple-700"
                            : user.role === "admin"
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-slate-500"
                        }
                      >
                        {user.role === "superadmin"
                          ? "Super Admin"
                          : user.role === "admin"
                          ? "Admin"
                          : "Korisnik"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString("bs-BA")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* PROMJENA ULOGE - SAMO SUPERADMIN */}
                        {isSuperAdmin && !targetIsSuperAdmin && (
                          <form
                            action={async () => {
                              "use server";
                              await toggleUserRole(user._id, user.role);
                            }}
                          >
                            <Button
                              size="icon"
                              variant="ghost"
                              title={
                                user.role === "admin"
                                  ? "Ukloni admin prava"
                                  : "Dodijeli admin prava"
                              }
                            >
                              {user.role === "admin" ? (
                                <ShieldOff className="w-4 h-4 text-orange-500" />
                              ) : (
                                <Shield className="w-4 h-4 text-green-600" />
                              )}
                            </Button>
                          </form>
                        )}

                        {/* BRISANJE - KORISTIMO KOMPONENTU SA POTVRDOM */}
                        {/* Prikazujemo gumb samo ako ima dozvolu (canDelete) */}
                        {canDelete && (
                          <UserDeleteButton
                            userId={user._id}
                            userName={`${user.name} ${user.lastName}`}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {users.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            Nema rezultata za "{query}"
          </div>
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
