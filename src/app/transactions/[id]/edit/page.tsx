"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useStore, TransactionType, PaymentMethod, Status } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputCurrency } from "@/components/ui/input-currency";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import imageCompression from 'browser-image-compression';

const tipoLabels: Record<string, string> = {
  'INCOME': '✅ Entrada (Receita)',
  'EXPENSE': '🔴 Saída (Despesa)',
};

const statusLabels: Record<string, string> = {
  'REALIZED': 'Efetuado / Pago',
  'PENDING': 'Pendente (Conta a Pagar/Receber)',
};

const pagamentoLabels: Record<string, string> = {
  'CASH': 'Dinheiro em Espécie',
  'BANK_TRANSFER': 'Transferência Bancária',
  'PIX': 'Pix',
  'CREDIT_CARD': 'Cartão de Crédito',
  'DEBIT_CARD': 'Cartão de Débito',
  'CHECK': 'Cheque',
  'BOLETO': 'Boleto',
};

export default function EditTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const transactionId = params.id as string;
  const { transactions, categories, costCenters, bankAccounts, updateTransaction, fetchAll, currentCompanyId } = useStore();
  
  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [costCenterId, setCostCenterId] = useState("");
  const [bankAccountId, setBankAccountId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [status, setStatus] = useState<Status>("REALIZED");
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isLoadingTransaction, setIsLoadingTransaction] = useState(true);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    const tx = transactions.find(t => t.id === transactionId);
    if (tx) {
      setType(tx.type as TransactionType);
      setAmount(tx.amount);
      setDate(new Date(tx.date).toISOString().split('T')[0]);
      setDescription(tx.description || "");
      setCategoryId(tx.category_id || "");
      setCostCenterId(tx.cost_center_id || "");
      setBankAccountId(tx.bank_account_id || "");
      setPaymentMethod(tx.payment_method as PaymentMethod);
      setStatus(tx.status as Status);
      setIsLoadingTransaction(false);
    } else if (transactions.length > 0) {
      // transação não encontrada (ex: ID inválido) - pode redirecionar para a lista
      setIsLoadingTransaction(false);
    }
  }, [transactions, transactionId]);

  // Filtra categorias baseado no tipo selecionado
  const filteredCategories = categories.filter(c => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId || !description) return;

    setSaving(true);
    try {
      let attachmentUrl = undefined;
      
      if (file) {
        setUploading(true);
        let fileToUpload = file;

        if (file.type.startsWith('image/')) {
          try {
            const options = {
              maxSizeMB: 1,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
            };
            fileToUpload = await imageCompression(file, options);
          } catch (error) {
            console.error("Erro ao comprimir imagem:", error);
          }
        }

        const fileExt = file.name.split('.').pop() || 'tmp';
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${currentCompanyId}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(filePath, fileToUpload);
          
        if (uploadError) {
          console.error("Erro no upload do anexo:", uploadError);
        } else {
          const { data } = supabase.storage.from('attachments').getPublicUrl(filePath);
          attachmentUrl = data.publicUrl;
        }
        setUploading(false);
      }

      await updateTransaction(transactionId, {
        type,
        amount,
        date,
        description,
        category_id: categoryId,
        cost_center_id: costCenterId && costCenterId !== "nenhum" ? costCenterId : null,
        bank_account_id: bankAccountId && bankAccountId !== "nenhum" ? bankAccountId : null,
        payment_method: paymentMethod,
        status,
        ...(attachmentUrl && { attachment_url: attachmentUrl })
      });
      router.push("/transactions");
    } catch (err) {
      console.error("Erro ao salvar:", err);
      setSaving(false);
      setUploading(false);
    }
  };

  if (isLoadingTransaction) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground text-lg animate-pulse">Carregando movimentação...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/transactions">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Editar Lançamento</h2>
          <p className="text-muted-foreground">Mofifique os dados da sua entrada ou saída.</p>
        </div>
      </div>

      <Card className="bg-card border-border shadow-sm">
        <form onSubmit={handleSubmit}>
          <CardContent className="pt-6 space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Movimentação</Label>
                <Select value={type} onValueChange={(val) => { setType(val as TransactionType); setCategoryId(""); }}>
                  <SelectTrigger className={`border-border ${type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'} font-semibold`}>
                    <span>{tipoLabels[type]}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INCOME" className="text-emerald-500 font-medium">✅ Entrada (Receita)</SelectItem>
                    <SelectItem value="EXPENSE" className="text-red-500 font-medium">🔴 Saída (Despesa)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status do Pagamento</Label>
                <Select value={status} onValueChange={(val) => setStatus(val as Status)}>
                  <SelectTrigger className="bg-background border-border">
                    <span>{statusLabels[status]}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REALIZED">Efetuado / Pago</SelectItem>
                    <SelectItem value="PENDING">Pendente (Conta a Pagar/Receber)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <InputCurrency 
                  id="amount" 
                  required
                  placeholder="R$ 0,00" 
                  value={amount} 
                  onChange={(val) => setAmount(val)} 
                  className="bg-background border-border text-lg font-bold text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Data da ocorrência</Label>
                <Input 
                  id="date" 
                  type="date" 
                  required
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  className="bg-background border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input 
                id="description" 
                placeholder="Ex: Compra de peças para máquina..." 
                required
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="bg-background border-border"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select required value={categoryId} onValueChange={(val) => setCategoryId(val || "")}>
                  <SelectTrigger className="bg-background border-border">
                    <span>{categoryId ? (filteredCategories.find(c => c.id === categoryId)?.name || 'Selecione...') : 'Selecione...'}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
                    ))}
                    {filteredCategories.length === 0 && (
                      <SelectItem value="none" disabled>Nenhuma categoria para este tipo.</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Centro de Custo (Opcional)</Label>
                <Select value={costCenterId || "nenhum"} onValueChange={(val) => setCostCenterId(val || "")}>
                  <SelectTrigger className="bg-background border-border">
                    <span>{costCenterId && costCenterId !== "nenhum" ? (costCenters.find(c => c.id === costCenterId)?.name || 'Nenhum') : 'Nenhum'}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">Nenhum</SelectItem>
                    {costCenters.map(cc => (
                      <SelectItem key={cc.id} value={cc.id}>{cc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Forma de Pagamento</Label>
                <Select value={paymentMethod} onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}>
                  <SelectTrigger className="bg-background border-border">
                    <span>{pagamentoLabels[paymentMethod]}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Dinheiro em Espécie</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Transferência Bancária</SelectItem>
                    <SelectItem value="PIX">Pix</SelectItem>
                    <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
                    <SelectItem value="DEBIT_CARD">Cartão de Débito</SelectItem>
                    <SelectItem value="CHECK">Cheque</SelectItem>
                    <SelectItem value="BOLETO">Boleto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Conta Bancária (Opcional)</Label>
                <Select value={bankAccountId || "nenhum"} onValueChange={(val) => setBankAccountId(val || "")}>
                  <SelectTrigger className="bg-background border-border">
                    <span>{bankAccountId && bankAccountId !== "nenhum" ? (bankAccounts.find(b => b.id === bankAccountId)?.name || 'Nenhuma') : 'Nenhuma'}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">Nenhuma</SelectItem>
                    {bankAccounts.map(ba => (
                      <SelectItem key={ba.id} value={ba.id}>{ba.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Label>Substituir Comprovante Opcionalmente</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground bg-muted/50 hover:bg-muted transition cursor-pointer relative">
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  accept=".jpg,.jpeg,.png,.pdf" 
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) setFile(selectedFile);
                  }}
                />
                <UploadCloud className="h-8 w-8 mb-2 text-gray-500" />
                {file ? (
                  <p className="text-sm font-medium text-emerald-500">{file.name}</p>
                ) : (
                  <>
                    <p className="text-sm font-medium">Clique ou arraste um PDF / Imagem</p>
                    <p className="text-xs">Imagens comprimidas automaticamente. PDF apenas enviar se for substituir (Máx 20MB).</p>
                  </>
                )}
              </div>
            </div>

          </CardContent>
          <div className="p-6 pt-0 flex justify-end">
            <Button type="submit" disabled={saving || uploading} className="bg-[#D4AF37] text-black hover:bg-[#FDB931] w-full sm:w-auto">
              <Save className="mr-2 h-4 w-4" /> {(saving || uploading) ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
