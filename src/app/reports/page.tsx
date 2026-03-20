"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileDown, FileText, ArrowUpIcon, ArrowDownIcon, DollarSign } from "lucide-react";

export default function ReportsPage() {
  const { transactions, categories, costCenters, fetchAll, loading } = useStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const realizedTransactions = transactions.filter(t => t.status === 'REALIZED');

  const totalIncome = realizedTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = realizedTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const getCategoryName = (id: string | null) => id ? categories.find(c => c.id === id)?.name || "Desconhecida" : "Sem categoria";

  const exportToExcel = async () => {
    try {
      const XLSX = (await import('xlsx')).default;
      const dataForExcel = realizedTransactions.map(t => ({
        'Data': new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
        'Descrição': t.description,
        'Tipo': t.type === 'INCOME' ? 'Entrada' : 'Saída',
        'Categoria': getCategoryName(t.category_id),
        'Valor (R$)': t.amount,
        'Status': t.status === 'REALIZED' ? 'Efetuado' : 'Pendente',
      }));
      const ws = XLSX.utils.json_to_sheet(dataForExcel);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Movimentações");
      XLSX.writeFile(wb, "relatorio_garimpo.xlsx");
    } catch(err) { console.error("Erro ao exportar:", err); }
  };

  const exportToPdf = async () => {
    try {
      const jsPDF = (await import('jspdf')).default;
      const autoTable = (await import('jspdf-autotable')).default;
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Relatório Financeiro - Garimpo", 14, 20);
      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);
      doc.text(`Total Entradas: R$ ${totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, 36);
      doc.text(`Total Saídas: R$ ${totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, 42);
      doc.text(`Resultado: R$ ${(totalIncome - totalExpense).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, 48);

      autoTable(doc, {
        startY: 56,
        head: [['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor']],
        body: realizedTransactions.map(t => [
          new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
          t.description || '-',
          t.type === 'INCOME' ? 'Entrada' : 'Saída',
          getCategoryName(t.category_id),
          `R$ ${t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        ]),
      });
      doc.save("relatorio_garimpo.pdf");
    } catch(err) { console.error("Erro ao exportar PDF:", err); }
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground text-lg animate-pulse">Carregando relatórios...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
          <p className="text-muted-foreground">Resumo financeiro e exportações.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-emerald-500 text-emerald-500 hover:bg-emerald-500/10" onClick={exportToExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar Excel
          </Button>
          <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10" onClick={exportToPdf}>
            <FileText className="mr-2 h-4 w-4" /> Exportar PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entradas</CardTitle>
            <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalIncome)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saídas</CardTitle>
            <ArrowDownIcon className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExpense)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resultado Líquido</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(totalIncome - totalExpense) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalIncome - totalExpense)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle>Movimentações Realizadas</CardTitle>
          <CardDescription>{realizedTransactions.length} lançamentos efetuados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {realizedTransactions.slice(0, 10).map(tx => (
              <div key={tx.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{tx.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{new Date(tx.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                    <span>|</span>
                    <span>{getCategoryName(tx.category_id)}</span>
                  </div>
                </div>
                <div className={`font-bold ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {tx.type === 'INCOME' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
