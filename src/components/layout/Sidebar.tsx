"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  ArrowRightLeft, 
  WalletCards, 
  Layers, 
  Settings, 
  Menu,
  FileText,
  History,
  LogOut
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { ModeToggle } from "@/components/theme-toggle";

const routes = [
  {
    label: "Painel",
    icon: BarChart3,
    href: "/",
    color: "text-sky-500",
  },
  {
    label: "Movimentações",
    icon: ArrowRightLeft,
    href: "/transactions",
    color: "text-violet-500",
  },
  {
    label: "Contas a Pagar/Receber",
    icon: WalletCards,
    href: "/pending",
    color: "text-amber-500",
  },
  {
    label: "Relatórios de Caixa",
    icon: FileText,
    href: "/reports",
    color: "text-emerald-500",
  },
  {
    label: "Cadastros Base",
    icon: Layers,
    href: "/settings/base",
    color: "text-orange-700",
  },
  {
    label: "Configurações",
    icon: Settings,
    href: "/settings",
    color: "text-gray-500",
  },
  {
    label: "Auditoria",
    icon: History,
    href: "/settings/logs",
    color: "text-blue-400",
  },
];

export const SidebarContent = () => {
  const pathname = usePathname();
  const { user, logout } = useStore();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-card border-r border-border text-card-foreground">
      <div className="px-3 py-2 flex-1 flex flex-col">
        <Link href="/" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FDB931]">
            Garimpo Finanças
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              href={route.href}
              key={route.href}
              className={`text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition ${
                pathname === route.href ? "text-foreground bg-black/5 dark:bg-white/10 font-bold" : "text-muted-foreground"
              }`}
            >
              <div className="flex items-center flex-1">
                <route.icon className={`h-5 w-5 mr-3 ${route.color}`} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-2 mt-auto border-t border-border space-y-4 pt-4">
        <div className="flex items-center justify-between px-3">
          <span className="text-sm text-muted-foreground font-medium">Tema Visual</span>
          <ModeToggle />
        </div>
        
        {user && (
          <div className="px-3 py-2 bg-black/5 dark:bg-white/5 rounded-lg">
            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Usuário</p>
            <p className="text-sm font-medium truncate">{user.email}</p>
          </div>
        )}

        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
          onClick={() => logout()}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sair do Sistema
        </Button>
      </div>
    </div>
  );
};

export const Sidebar = () => {
  return (
    <>
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-background">
        <SidebarContent />
      </div>
    </>
  );
};

export const MobileSidebar = () => {
  return (
    <Sheet>
      <SheetTrigger className="md:hidden flex items-center justify-center rounded-md h-10 w-10 text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
        <Menu className="h-6 w-6" />
      </SheetTrigger>
      <SheetContent side="left" className="p-0 border-none bg-background w-72">
        <SidebarContent />
      </SheetContent>
    </Sheet>
  );
};
