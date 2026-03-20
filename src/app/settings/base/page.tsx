"use client";

import { useEffect, useState } from "react";
import { useStore, TransactionType } from "@/store/useStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Tag, MapPin, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function BaseSettingsPage() {
  const categories = useStore(state => state.categories);
  const costCenters = useStore(state => state.costCenters);
  const addCategory = useStore(state => state.addCategory);
  const deleteCategory = useStore(state => state.deleteCategory);
  const addCostCenter = useStore(state => state.addCostCenter);
  const deleteCostCenter = useStore(state => state.deleteCostCenter);
  const loading = useStore(state => state.loading);

  const [catName, setCatName] = useState("");
  const [catType, setCatType] = useState<TransactionType>("EXPENSE");
  const [ccName, setCcName] = useState("");
  const [ccDescription, setCcDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      toast.error("Por favor, preencha o nome da categoria.");
      return;
    }
    setSaving(true);
    try {
      await addCategory({ name: catName, type: catType });
      setCatName("");
      toast.success("Categoria adicionada com sucesso!");
    } catch(err: any) { 
      console.error("Erro:", err);
      toast.error(err?.message || "Erro ao adicionar categoria.");
    }
    setSaving(false);
  };

  const handleAddCostCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ccName.trim()) {
      toast.error("Por favor, preencha o nome do centro de custo.");
      return;
    }
    setSaving(true);
    try {
      await addCostCenter({ name: ccName, description: ccDescription });
      setCcName("");
      setCcDescription("");
      toast.success("Centro de custo adicionado com sucesso!");
    } catch(err: any) { 
      console.error("Erro:", err);
      toast.error(err?.message || "Erro ao adicionar centro de custo.");
    }
    setSaving(false);
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      toast.success("Categoria excluída com sucesso!");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao excluir categoria. Ela pode estar em uso.");
    }
  };

  const handleDeleteCostCenter = async (id: string) => {
    try {
      await deleteCostCenter(id);
      toast.success("Centro de custo excluído com sucesso!");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao excluir centro de custo. Ele pode estar em uso.");
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground text-lg animate-pulse">Carregando configurações...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Cadastros Base</h2>
        <p className="text-muted-foreground">
          Gerencie categorias e centros de custo do sistema.
        </p>
      </div>

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList className="bg-muted border-border">
          <TabsTrigger value="categories"><Tag className="mr-2 h-4 w-4" /> Categorias</TabsTrigger>
          <TabsTrigger value="cost-centers"><MapPin className="mr-2 h-4 w-4" /> Centros de Custo</TabsTrigger>
        </TabsList>

        {/* CATEGORIAS */}
        <TabsContent value="categories" className="space-y-4">
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle>Adicionar Categoria</CardTitle>
              <CardDescription>Crie novas categorias para classificar suas movimentações.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input 
                    placeholder="Nome da Categoria (ex: Peças e Equipamentos)" 
                    value={catName} 
                    onChange={(e) => setCatName(e.target.value)} 
                    className="bg-background border-border"
                    required
                  />
                </div>
                <Select value={catType} onValueChange={(val) => setCatType(val as TransactionType)}>
                  <SelectTrigger className="w-[180px] bg-background border-border">
                    <span>{catType === 'INCOME' ? '✅ Entrada' : '🔴 Saída'}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INCOME" className="text-emerald-500">Entrada</SelectItem>
                    <SelectItem value="EXPENSE" className="text-red-500">Saída</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" disabled={saving} className="bg-[#D4AF37] text-black hover:bg-[#FDB931]">
                  <Plus className="mr-2 h-4 w-4" /> {saving ? 'Salvando...' : 'Adicionar'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid gap-3 md:grid-cols-2">
            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-emerald-500">Categorias de Entrada</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.filter(c => c.type === 'INCOME').map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition">
                      <div className="flex items-center gap-2">
                        <span>{cat.icon || '📂'}</span>
                        <span className="text-sm font-medium">{cat.name}</span>
                        {cat.is_default && <span className="text-xs text-muted-foreground italic">(padrão)</span>}
                      </div>
                      {!cat.is_default && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-500/10"
                          onClick={() => handleDeleteCategory(cat.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-red-500">Categorias de Saída</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.filter(c => c.type === 'EXPENSE').map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition">
                      <div className="flex items-center gap-2">
                        <span>{cat.icon || '📂'}</span>
                        <span className="text-sm font-medium">{cat.name}</span>
                        {cat.is_default && <span className="text-xs text-muted-foreground italic">(padrão)</span>}
                      </div>
                      {!cat.is_default && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-500/10"
                          onClick={() => handleDeleteCategory(cat.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* CENTROS DE CUSTO */}
        <TabsContent value="cost-centers" className="space-y-4">
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle>Adicionar Centro de Custo</CardTitle>
              <CardDescription>Centros de custo representam frentes, máquinas ou áreas.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCostCenter} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input 
                    placeholder="Nome (ex: Frente Sul)" 
                    value={ccName} 
                    onChange={(e) => setCcName(e.target.value)} 
                    className="bg-background border-border"
                    required
                  />
                </div>
                <div className="flex-1">
                  <Input 
                    placeholder="Descrição (opcional)" 
                    value={ccDescription} 
                    onChange={(e) => setCcDescription(e.target.value)} 
                    className="bg-background border-border"
                  />
                </div>
                <Button type="submit" disabled={saving} className="bg-[#D4AF37] text-black hover:bg-[#FDB931]">
                  <Plus className="mr-2 h-4 w-4" /> {saving ? 'Salvando...' : 'Adicionar'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle>Centros de Custo Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {costCenters.map(cc => (
                  <div key={cc.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50 hover:bg-muted transition">
                    <div>
                      <p className="text-sm font-medium">{cc.name}</p>
                      {cc.description && <p className="text-xs text-muted-foreground">{cc.description}</p>}
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-500/10"
                      onClick={() => handleDeleteCostCenter(cc.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                {costCenters.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-4">Nenhum centro de custo cadastrado.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
