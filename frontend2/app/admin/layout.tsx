import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ShoppingBag,
  ArrowLeft,
  Banknote,
  LogOut,
  ScanBarcode,
} from "lucide-react";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || !session.isAdmin) {
    redirect("/");
  }

  const userName = (session.name as string) || "Admin";
  const userEmail = (session.email as string) || "";

  return (
    <div className="flex min-h-screen bg-slate-100/50">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0f172a] text-white hidden md:flex flex-col fixed inset-y-0 left-0 z-50">
        {/* VRH SIDEBARA */}
        <div className="p-6 pb-2">
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 mb-4">
            🛡️ Admin Panel
          </h2>

          {/* --- NOVO MJESTO ZA GUMB --- */}
          <Button
            variant="secondary"
            asChild
            className="w-full justify-start font-semibold bg-slate-800 text-white hover:bg-slate-700 hover:text-white border border-slate-700"
          >
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Nazad na web
            </Link>
          </Button>
          {/* --------------------------- */}
        </div>

        {/* NAVIGACIJA */}
        <nav className="flex-1 px-4 space-y-2 mt-6">
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Izbornik
          </p>
          <SidebarLink
            href="/admin/dashboard"
            icon={LayoutDashboard}
            label="Pregled"
          />
          <SidebarLink href="/admin/revenue" icon={Banknote} label="Prihodi" />
          <SidebarLink href="/admin/userlist" icon={Users} label="Korisnici" />
          <SidebarLink
            href="/admin/eventlist"
            icon={Calendar}
            label="Događaji"
          />
          <SidebarLink
            href="/admin/orderlist"
            icon={ShoppingBag}
            label="Narudžbe"
          />
          <SidebarLink
            href="/admin/scanner"
            icon={ScanBarcode}
            label="Skener Ulaza"
          />
        </nav>

        {/* User Info na dnu sidebara */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-slate-600">
              <AvatarFallback className="bg-slate-700 text-white">
                {userName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate text-white">
                {userName}
              </p>
              <p className="text-xs text-slate-400 truncate">{userEmail}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* GLAVNI SADRŽAJ */}
      <main className="flex-1 md:ml-64 p-8 min-h-screen">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

function SidebarLink({ href, icon: Icon, label }: any) {
  return (
    <Button
      variant="ghost"
      asChild
      className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
    >
      <Link href={href}>
        <Icon className="mr-3 h-5 w-5" />
        {label}
      </Link>
    </Button>
  );
}
