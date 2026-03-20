"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Plus } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PendingAccountsPage() {
  const transactions = useStore(state => state.transactions);
  const categories = useStore(state => state.categories);
  const loading = useStore(state => state.loading);
  const markTransactionAsRealized = useStore(state => state.markTransactionAsRealized);

  const pendingTransactions = transactions
    .filter(t => t.status === 'PENDING')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getCategoryName = (id: string | null) => id ? categories.find(c => c.id === id)?.name || "Desconhecida" : "Sem categoria";

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground text-lg animate-pulse">Carregando contas pendentes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Contas a Pagar/Receber</h2>
          <p className="text-muted-foreground">
            Gerencie seus compromissos e recebimentos futuros.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/transactions/new">
            <Button className="bg-[#D4AF37] text-black hover:bg-[#FDB931]">
              <Plus className="mr-2 h-4 w-4" /> Novo Agendamento
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-muted border-border">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="payable">A Pagar (Saídas)</TabsTrigger>
          <TabsTrigger value="receivable">A Receber (Entradas)</TabsTrigger>
        </TabsList>

        <Card className="bg-card border-border mt-4">
          <CardHeader>
            <CardTitle>Lançamentos Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <TabsContent value="all" className="m-0">
              <PendingTable 
                data={pendingTransactions} 
                getCategoryName={getCategoryName} 
                onRealize={markTransactionAsRealized} 
              />
            </TabsContent>
            <TabsContent value="payable" className="m-0">
              <PendingTable 
                data={pendingTransactions.filter(t => t.type === 'EXPENSE')} 
                getCategoryName={getCategoryName} 
                onRealize={markTransactionAsRealized} 
              />
            </TabsContent>
            <TabsContent value="receivable" className="m-0">
              <PendingTable 
                data={pendingTransactions.filter(t => t.type === 'INCOME')} 
                getCategoryName={getCategoryName} 
                onRealize={markTransactionAsRealized} 
              />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}

function PendingTable({ data, getCategoryName, onRealize }: any) {
  if (data.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground border border-border rounded-md">
        Nenhuma conta pendente nesta categoria.
      </div>
    );
  }

  const isOverdue = (dateString: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const dueDate = new Date(dateString);
    dueDate.setMinutes(dueDate.getMinutes() + dueDate.getTimezoneOffset());
    return dueDate < today;
  };

  return (
    <div className="rounded-md border border-border overflow-x-auto">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="border-border hover:bg-transparent">
            <TableHead>Vencimento / Previsão</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="w-[150px] text-center">Ação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((tx: any) => {
            const overdue = isOverdue(tx.date);
            return (
              <TableRow key={tx.id} className={`border-border hover:bg-muted/50 ${overdue ? 'bg-destructive/5' : ''}`}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {overdue ? <Clock className="h-4 w-4 text-red-500" /> : <Clock className="h-4 w-4 text-amber-500" />}
                    <span className={overdue ? 'text-red-500 font-bold' : ''}>
                      {new Date(tx.date).toLocaleDateString("pt-BR", { timeZone: 'UTC' })}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{tx.description}</TableCell>
                <TableCell>{getCategoryName(tx.category_id)}</TableCell>
                <TableCell>
                  {tx.type === 'INCOME' ? 
                    <span className="text-emerald-500">A Receber</span> : 
                    <span className="text-red-500">A Pagar</span>
                  }
                </TableCell>
                <TableCell className={`text-right font-bold ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-red-500'}`}>
                   {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.amount)}
                </TableCell>
                <TableCell className="text-center">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-colors"
                    onClick={() => onRealize(tx.id)}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Baixar
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  );
}
