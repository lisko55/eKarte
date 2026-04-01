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
} from "lucide-react";

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
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

import { useCart } from "@/context/cart-context";
import { logoutUser } from "@/actions/auth-actions";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartItems, clearCart } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSheetOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      setUserInfo(JSON.parse(storedUser));
    }
  }, []);

  const itemCount = cartItems.reduce(
    (sum: number, item: any) => sum + item.quantity,
    0,
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

  // --- NOVA LOGIKA ZA ULOGE ---
  const userRole = userInfo?.role;
  const hasPanelAccess =
    userRole === "admin" ||
    userRole === "superadmin" ||
    userRole === "organizer" ||
    userRole === "scanner";
  const panelLink =
    userRole === "scanner" ? "/admin/scanner" : "/admin/dashboard";
  const panelName =
    userRole === "organizer"
      ? "Partner Panel"
      : userRole === "scanner"
        ? "Skener"
        : "Admin Panel";
  // ----------------------------

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* 1. MOBILNI MENI (HAMBURGER) */}
        <div className="md:hidden mr-2">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen} modal={false}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <VisuallyHidden.Root>
                <SheetTitle>Meni</SheetTitle>
              </VisuallyHidden.Root>
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

                  {/* MOBILNI DUGME ZA PANEL */}
                  {hasPanelAccess && (
                    <Link
                      href={panelLink}
                      onClick={() => setIsSheetOpen(false)}
                      className="text-lg font-bold text-blue-600"
                    >
                      {panelName}
                    </Link>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* 2. LOGO */}
        <Link
          href="/"
          className="flex items-center space-x-2 font-bold text-xl mr-auto md:mr-0"
        >
          <span>TvojLogo</span>
        </Link>

        {/* 3. DESKTOP NAVIGACIJA */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium ml-6">
          <Link href="/" className="transition-colors hover:text-primary">
            Početna
          </Link>

          {/* DESKTOP DUGME ZA PANEL */}
          {hasPanelAccess && (
            <Button
              variant="ghost"
              asChild
              className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold"
            >
              <Link href={panelLink}>
                <LayoutDashboard className="h-4 w-4" /> {panelName}
              </Link>
            </Button>
          )}
        </nav>

        {/* 4. DESNA STRANA (Cart & User) */}
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
                  <Avatar className="h-8 w-8 border border-slate-200">
                    <AvatarImage
                      src={userInfo.avatar || ""}
                      alt={userInfo.name}
                    />
                    <AvatarFallback className="bg-slate-900 text-white font-bold">
                      {userInfo.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none">
                      {userInfo.name} {userInfo.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {userInfo.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* LINK NA PANEL U DROPDOWNU TAKOĐER */}
                {hasPanelAccess && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link
                        href={panelLink}
                        className="cursor-pointer w-full flex items-center font-bold text-blue-600"
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" /> {panelName}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

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
                    className="cursor-pointer w-full flex items-center font-semibold text-primary"
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
                  className="text-red-600 cursor-pointer font-medium"
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
              <Button
                asChild
                size="sm"
                className="px-4 bg-slate-900 hover:bg-slate-800"
              >
                <Link href="/register">Registracija</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
