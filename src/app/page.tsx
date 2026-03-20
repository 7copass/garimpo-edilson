"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon, DollarSign, WalletCards } from "lucide-react";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";

const chartConfig = {
  income: {
    label: "Entradas (R$)",
    theme: { light: "#10b981", dark: "#10b981" },
  },
  expense: {
    label: "Saídas (R$)",
    theme: { light: "#ef4444", dark: "#ef4444" },
  },
} satisfies ChartConfig;

export default function Home() {
  const transactions = useStore(state => state.transactions);
  const loading = useStore(state => state.loading);

  // Cálculos com dados reais do banco
  const totalIncome = transactions
    .filter(t => t.type === 'INCOME' && t.status === 'REALIZED')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE' && t.status === 'REALIZED')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const currentBalance = totalIncome - totalExpense;

  const pendingExpenses = transactions
    .filter(t => t.type === 'EXPENSE' && t.status === 'PENDING')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Generate chart data by aggregating realized transactions per day
  const chartData = useMemo(() => {
    const dailyData: Record<string, { income: number; expense: number }> = {};
    
    const sortedTx = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedTx.forEach(tx => {
      if (tx.status !== 'REALIZED') return;
      const dateStr = new Date(tx.date).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: '2-digit' });
      
      if (!dailyData[dateStr]) {
        dailyData[dateStr] = { income: 0, expense: 0 };
      }
      if (tx.type === 'INCOME') dailyData[dateStr].income += tx.amount;
      if (tx.type === 'EXPENSE') dailyData[dateStr].expense += tx.amount;
    });

    return Object.keys(dailyData).map(date => ({
      date,
      income: dailyData[date].income,
      expense: dailyData[date].expense,
    }));
  }, [transactions]);

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground text-lg animate-pulse">Carregando dados...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Painel</h2>
        <p className="text-muted-foreground">
          Visão geral financeira do garimpo.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Baseado nas movimentações realizadas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas Realizadas</CardTitle>
            <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total recebido no período
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saídas Realizadas</CardTitle>
            <ArrowDownIcon className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExpense)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total pago no período
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contas a Pagar (Pendentes)</CardTitle>
            <WalletCards className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pendingExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              Agendamentos futuros não realizados
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4 bg-card border-border shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle>Visão Simplificada</CardTitle>
            <p className="text-sm text-muted-foreground">Comparativo diário de Entradas vs Saídas</p>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            {chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-full w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      fontSize={12}
                      stroke="hsl(var(--muted-foreground))" 
                    />
                    <YAxis 
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      fontSize={12}
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value) => value >= 1000 ? `R$ ${(value / 1000).toFixed(1)}k` : `R$ ${value}`}
                    />
                    <ChartTooltip cursor={{ fill: 'hsl(var(--muted)/0.5)' }} content={<ChartTooltipContent indicator="dashed" />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="income" fill="var(--theme-light)" radius={[4, 4, 0, 0]} maxBarSize={40} className="fill-emerald-500 dark:fill-emerald-500" />
                    <Bar dataKey="expense" fill="var(--theme-light)" radius={[4, 4, 0, 0]} maxBarSize={40} className="fill-red-500 dark:fill-red-500" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground bg-muted/30 rounded-md border border-dashed border-border min-h-[200px]">
                Sem dados suficientes para o gráfico no período selecionado.
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-3 bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle>Últimas Movimentações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.slice(0, 5).map(transaction => (
                <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </p>
                  </div>
                  <div className={`font-bold sm:font-medium text-lg sm:text-base ${transaction.type === 'INCOME' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {transaction.type === 'INCOME' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transaction.amount)}
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma movimentação encontrada.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
