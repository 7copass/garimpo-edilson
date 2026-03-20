"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { supabase } from "@/lib/supabase";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { History, Search, User as UserIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AuditLogsPage() {
  const { currentCompanyId } = useStore();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      if (!currentCompanyId) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .eq('company_id', currentCompanyId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error) {
        setLogs(data || []);
      }
      setLoading(false);
    };

    fetchLogs();
  }, [currentCompanyId]);

  const filteredLogs = logs.filter(log => 
    log.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'INSERT': return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Criação</Badge>;
      case 'UPDATE': return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Edição</Badge>;
      case 'DELETE': return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Exclusão</Badge>;
      default: return <Badge variant="outline">{action}</Badge>;
    }
  };

  const getTableName = (name: string) => {
    const names: Record<string, string> = {
      'transactions': 'Movimentação',
      'categories': 'Categoria',
      'cost_centers': 'Centro de Custo',
      'bank_accounts': 'Conta Bancária',
      'companies': 'Configurações'
    };
    return names[name] || name;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <History className="w-6 h-6 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Logs de Auditoria</h1>
        </div>
        <p className="text-muted-foreground">
          Histórico completo de alterações realizadas no sistema.
        </p>
      </div>

      <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Histórico Recente</CardTitle>
            <CardDescription>Visualizando as últimas 100 ações realizadas.</CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filtrar tabela ou ação..."
              className="pl-8 bg-background/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/40 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[180px]">Data/Hora</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Tabela</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead className="text-right">Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        Carregando logs...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      Nenhum log encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium text-xs">
                        {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell className="font-medium">{getTableName(log.table_name)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs">
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                            <UserIcon className="w-3 h-3" />
                          </div>
                          <span className="truncate max-w-[120px]">{log.user_id ? "Usuário Autenticado" : "Sistema/Admin"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="text-[10px] cursor-help" title={JSON.stringify(log.new_data || log.old_data)}>Ver JSON</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
