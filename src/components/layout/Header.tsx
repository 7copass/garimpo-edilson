"use client";

import { usePathname } from "next/navigation";
import { MobileSidebar } from "./Sidebar";
import { ModeToggle } from "../theme-toggle";
import { GlobalDateFilter } from "./GlobalDateFilter";

export const Header = () => {
  const pathname = usePathname();
  const isSettingsRoute = pathname?.startsWith("/settings");

  return (
    <div className="flex items-center justify-between p-4 border-b bg-background border-border">
      <div className="flex items-center gap-4">
        <div className="md:hidden">
          <MobileSidebar />
        </div>
        <div className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FDB931] md:hidden">
          Garimpo
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {!isSettingsRoute && (
          <div className="hidden sm:block">
            <GlobalDateFilter />
          </div>
        )}
        <ModeToggle />
      </div>
    </div>
  );
};
