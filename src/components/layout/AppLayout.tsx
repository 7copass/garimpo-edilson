"use client";

import { useEffect, useState, memo } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useStore } from "@/store/useStore";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = memo(({ children }: AppLayoutProps) => {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  
  // Seletores individuais para evitar re-renders globais
  const checkAuth = useStore(state => state.checkAuth);
  const fetchAll = useStore(state => state.fetchAll);
  const user = useStore(state => state.user);
  const currentCompanyId = useStore(state => state.currentCompanyId);
  
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        await checkAuth();
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, [checkAuth]);

  // Busca dados apenas quando temos um usuário e uma empresa selecionada
  useEffect(() => {
    if (user && currentCompanyId) {
      fetchAll();
    }
  }, [user, currentCompanyId, fetchAll]);

  if (isInitializing) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          <p className="text-sm font-medium animate-pulse">Carregando Garimpo...</p>
        </div>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="h-full relative overflow-hidden bg-background">
      <Sidebar />
      <main className="md:pl-72 flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 p-4 md:p-8 space-y-4 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
});

AppLayout.displayName = "AppLayout";
