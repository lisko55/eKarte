"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation"; // Samo jedan import
import {
  ShoppingCart,
  User,
  LogOut,
  Package,
  LayoutDashboard,
  Ticket,
} from "lucide-react";

// Shadcn komponente
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Context i Actions
import { useCart } from "@/context/cart-context";
import { logoutUser } from "@/actions/auth-actions";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  // Svi hookovi moraju biti pozvani na vrhu, PRIJE bilo kakvog return-a
  const { cartItems, clearCart } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      setUserInfo(JSON.parse(storedUser));
    }
  }, []);

  const itemCount = cartItems.reduce(
    (sum: number, item: any) => sum + item.quantity,
    0
  );

  const handleLogout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    setUserInfo(null);
    clearCart();
    await logoutUser();
    router.refresh();
  };

  // --- POPRAVAK: Provjera rute ide TEK OVDJE ---
  // Ako smo na admin ruti, ne prikazuj header, ali hookovi su se već izvršili
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  if (!isMounted) {
    return <header className="h-16 border-b bg-background" />;
  }

  const isAdmin =
    userInfo && (userInfo.role === "admin" || userInfo.role === "superadmin");

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* 1. LOGO I GLAVNI LINKOVI */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center space-x-2 font-bold text-xl"
          >
            <span>TvojLogo</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href="/"
              className={`transition-colors hover:text-primary ${
                pathname === "/" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Početna
            </Link>

            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex gap-2 items-center">
                    <LayoutDashboard className="h-4 w-4" />
                    Admin
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Admin Panel</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin/dashboard">Pregled</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/dashboard">Prihodi</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/userlist">Korisnici</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/eventlist">Događaji</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/orderlist">Narudžbe</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
        </div>

        {/* 2. DESNA STRANA */}
        <div className="flex items-center gap-4">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full p-0 text-xs">
                  {itemCount}
                </Badge>
              )}
            </Button>
          </Link>

          {userInfo ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={userInfo.avatar || ""}
                      alt={userInfo.name}
                    />
                    <AvatarFallback>
                      {userInfo.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {userInfo.name} {userInfo.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userInfo.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/profile"
                    className="cursor-pointer flex w-full items-center"
                  >
                    <User className="mr-2 h-4 w-4" /> Profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/my-tickets"
                    className="cursor-pointer flex w-full items-center font-semibold text-primary"
                  >
                    <Ticket className="mr-2 h-4 w-4" />{" "}
                    {/* Importaj Ticket iz lucide-react */}
                    Moje Ulaznice
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/my-orders"
                    className="cursor-pointer flex w-full items-center"
                  >
                    <Package className="mr-2 h-4 w-4" /> Moje Narudžbe
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Odjava
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Prijava</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Registracija</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
