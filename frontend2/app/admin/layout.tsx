import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ShoppingBag,
  ArrowLeft,
  Banknote,
  Menu,
  ScanBarcode,
} from "lucide-react";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // <--- NOVO

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || !session.isAdmin) redirect("/");

  const userName = (session.name as string) || "Admin";
  const userEmail = (session.email as string) || "";

  // Izdvojeni sadržaj sidebara da ga možemo koristiti i za Desktop i za Mobile
  const SidebarContent = () => (
    <div className="flex flex-col h-full text-white">
      <div className="p-6 pb-2">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 mb-4 text-white">
          🛡️ Admin
        </h2>
        <Button
          variant="secondary"
          asChild
          className="w-full justify-start font-semibold bg-slate-800 text-white hover:bg-slate-700 border border-slate-700"
        >
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Nazad na web
          </Link>
        </Button>
      </div>

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
        <SidebarLink href="/admin/eventlist" icon={Calendar} label="Događaji" />
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

      <div className="p-4 border-t border-slate-800 bg-slate-900/50 mt-auto">
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
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-100/50">
      {/* 1. DESKTOP SIDEBAR (Skriven na mobitelu) */}
      <aside className="w-64 bg-[#0f172a] hidden md:flex flex-col fixed inset-y-0 left-0 z-50">
        <SidebarContent />
      </aside>

      {/* 2. MOBILNI HEADER (Vidljiv samo na mobitelu) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0f172a] z-50 flex items-center px-4 justify-between border-b border-slate-800">
        <h2 className="text-lg font-bold text-white">Admin Panel</h2>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-slate-800"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="p-0 bg-[#0f172a] border-slate-800 w-[280px]"
          >
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* GLAVNI SADRŽAJ */}
      {/* Na mobitelu dodajemo padding-top (pt-16) da header ne prekrije sadržaj */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 min-h-screen pt-20 md:pt-8">
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
