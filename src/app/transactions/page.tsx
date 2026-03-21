"use client";

import { useEffect } from "react";
import { useStore, Transaction } from "@/store/useStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Edit, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function TransactionsPage() {
  const transactions = useStore(state => state.transactions);
  const categories = useStore(state => state.categories);
  const costCenters = useStore(state => state.costCenters);
  const loading = useStore(state => state.loading);
  const deleteTransactionWithReason = useStore(state => state.deleteTransactionWithReason);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!deleteReason.trim()) {
      toast.error("Por favor, informe o motivo da exclusão.");
      return;
    }
    if (!transactionToDelete) return;

    setIsDeleting(true);
    try {
      await deleteTransactionWithReason(transactionToDelete, deleteReason);
      toast.success("Movimentação excluída com sucesso.");
      setTransactionToDelete(null);
      setDeleteReason("");
    } catch (err: any) {
      toast.error(err.message || "Erro ao excluir movimentação.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getCategoryName = (id: string | null) => id ? categories.find(c => c.id === id)?.name || "Desconhecida" : "Sem categoria";
  const getCostCenterName = (id?: string | null) => id ? costCenters.find(c => c.id === id)?.name || "Não atribuído" : "Não atribuído";
  
  const paymentMethodLabels: Record<string, string> = {
    'CASH': 'Dinheiro em Espécie',
    'BANK_TRANSFER': 'Transferência',
    'PIX': 'Pix',
    'CREDIT_CARD': 'Cartão de Crédito',
    'DEBIT_CARD': 'Cartão de Débito',
    'CHECK': 'Cheque',
    'BOLETO': 'Boleto',
  };

  const filteredTransactions = transactions.filter(t => 
    t.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    getCategoryName(t.category_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCostCenterName(t.cost_center_id).toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground text-lg animate-pulse">Carregando movimentações...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Movimentações</h2>
          <p className="text-muted-foreground">
            Extrato de entradas e saídas do garimpo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/transactions/new">
            <Button className="bg-[#D4AF37] text-black hover:bg-[#FDB931]">
              <Plus className="mr-2 h-4 w-4" /> Novo Lançamento
            </Button>
          </Link>
        </div>
      </div>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar lançamento..."
                className="pl-8 bg-background border-border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Centro Custo</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Anexo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-[100px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow className="border-border hover:bg-transparent">
                    <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                      Nenhuma movimentação encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((tx) => (
                    <TableRow key={tx.id} className="border-border hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {new Date(tx.date).toLocaleDateString("pt-BR", { timeZone: 'UTC' })}
                      </TableCell>
                      <TableCell>{tx.description || "-"}</TableCell>
                      <TableCell>{getCategoryName(tx.category_id)}</TableCell>
                      <TableCell>{getCostCenterName(tx.cost_center_id)}</TableCell>
                      <TableCell>{paymentMethodLabels[tx.payment_method]}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          tx.status === 'REALIZED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {tx.status === 'REALIZED' ? 'Efetuado' : 'Pendente'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {tx.attachment_url ? (
                          <a 
                            href={tx.attachment_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 p-2 rounded-md transition-colors"
                            title="Visualizar Anexo"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className={`text-right font-bold ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            onClick={() => setTransactionToDelete(tx.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!transactionToDelete} onOpenChange={(open) => {
        if (!open) {
          setTransactionToDelete(null);
          setDeleteReason("");
        }
      }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Excluir Movimentação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta movimentação? Esta ação não pode ser desfeita.
              Para fins de auditoria, por favor informe o motivo da exclusão.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason" className="mb-2 block">Motivo da Exclusão <span className="text-red-500">*</span></Label>
            <Input
              id="reason"
              placeholder="Ex: Lançamento duplicado, erro de valor..."
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              className="w-full bg-background border-border"
              required
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransactionToDelete(null)} disabled={isDeleting}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting} className="bg-red-500 hover:bg-red-600 text-white">
              {isDeleting ? "Excluindo..." : "Confirmar Exclusão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
