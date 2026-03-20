"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Landmark, Loader2, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success("Login realizado com sucesso!");
      // O middleware redirecionará automaticamente ou o store fará o reload
      window.location.href = "/";
    } catch (err: any) {
      toast.error(err.message || "Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/10 blur-[120px] rounded-full" />
      
      <div className="z-10 w-full max-w-md px-4">
        <div className="flex flex-col items-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-600/20 mb-4 transform hover:rotate-6 transition-transform">
            <Landmark className="text-black w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Garimpo Finanças</h1>
          <p className="text-muted-foreground">Gestão financeira profissional</p>
        </div>

        <Card className="border-border/40 bg-card/60 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
          <CardHeader>
            <CardTitle className="text-xl">Acessar Sistema</CardTitle>
            <CardDescription>Entre com suas credenciais para continuar</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@garimpo.com.br" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/50 border-border/50 focus:border-amber-500/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50 border-border/50 focus:border-amber-500/50 transition-colors"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold h-11 shadow-lg shadow-amber-600/10"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Lock className="w-4 h-4 mr-2" />
                )}
                Entrar no Sistema
              </Button>
            </CardFooter>
          </form>
        </Card>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Garimpo Finanças. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
