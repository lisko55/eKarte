"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ShoppingCart,
  User,
  LogOut,
  Settings,
  LayoutDashboard,
  Menu,
  Package,
  Ticket,
} from "lucide-react"; // Dodaj Menu ikonu

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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // <--- NOVI IMPORT

import { useCart } from "@/context/cart-context";
import { logoutUser } from "@/actions/auth-actions";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartItems, clearCart } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false); // Za zatvaranje menija na klik

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

  if (pathname?.startsWith("/admin")) return null;
  if (!isMounted) return <header className="h-16 border-b bg-background" />;

  const isAdmin =
    userInfo && (userInfo.role === "admin" || userInfo.role === "superadmin");

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* 1. MOBILNI MENI (HAMBURGER) - Vidi se samo na mobitelu (md:hidden) */}
        <div className="md:hidden mr-2">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-6 mt-6">
                <Link
                  href="/"
                  onClick={() => setIsSheetOpen(false)}
                  className="text-xl font-bold"
                >
                  TvojLogo
                </Link>
                <nav className="flex flex-col gap-4">
                  <Link
                    href="/"
                    onClick={() => setIsSheetOpen(false)}
                    className="text-lg font-medium hover:text-primary"
                  >
                    Početna
                  </Link>
                  {/* Ovdje možeš dodati linkove na kategorije */}
                  <Link
                    href="/?category=Muzika"
                    onClick={() => setIsSheetOpen(false)}
                    className="text-lg font-medium hover:text-primary"
                  >
                    Koncerti
                  </Link>
                  <Link
                    href="/?category=Sport"
                    onClick={() => setIsSheetOpen(false)}
                    className="text-lg font-medium hover:text-primary"
                  >
                    Sport
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setIsSheetOpen(false)}
                      className="text-lg font-medium text-blue-600"
                    >
                      Admin Panel
                    </Link>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* 2. LOGO (Uvijek vidljiv) */}
        <Link
          href="/"
          className="flex items-center space-x-2 font-bold text-xl mr-auto md:mr-0"
        >
          <span>TvojLogo</span>
        </Link>

        {/* 3. DESKTOP NAVIGACIJA - Sakrivena na mobitelu (hidden md:flex) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium ml-6">
          <Link href="/" className="transition-colors hover:text-primary">
            Početna
          </Link>
          {isAdmin && (
            <Button variant="ghost" asChild className="gap-2">
              <Link href="/admin/dashboard">
                <LayoutDashboard className="h-4 w-4" /> Admin
              </Link>
            </Button>
          )}
        </nav>

        {/* 4. DESNA STRANA (Cart & User) - Uvijek vidljivo */}
        <div className="flex items-center gap-2 md:gap-4 ml-auto">
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
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {userInfo.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {userInfo.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/profile"
                    className="cursor-pointer w-full flex items-center"
                  >
                    <User className="mr-2 h-4 w-4" /> Profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/my-tickets"
                    className="cursor-pointer w-full flex items-center"
                  >
                    <Ticket className="mr-2 h-4 w-4" /> Moje Ulaznice
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/my-orders"
                    className="cursor-pointer w-full flex items-center"
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
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href="/login">Prijava</Link>
              </Button>
              <Button asChild size="sm" className="px-4">
                <Link href="/register">Registracija</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
