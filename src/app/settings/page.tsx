"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save, Building2, MapPin, Phone, FileText } from "lucide-react";
import { COMPANY_ID } from "@/lib/supabase";

export default function SettingsPage() {
  const { company, fetchAll, updateCompany, loading } = useStore();

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    document: "",
    phone: "",
    address: "",
    city: "",
    state: "",
  });

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Populando o state local quando os dados da empresa chegarem
  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || "",
        document: company.document || "",
        phone: company.phone || "",
        address: company.address || "",
        city: company.city || "",
        state: company.state || "",
      });
    }
  }, [company]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateCompany(COMPANY_ID, formData);
      // Feedback opcional de sucesso
    } catch (err) {
      console.error("Erro ao salvar configurações", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !company) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground text-lg animate-pulse">Carregando configurações...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações do Garimpo</h2>
        <p className="text-muted-foreground">
          Gerencie as informações principais do seu garimpo.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              Dados Gerais
            </CardTitle>
            <CardDescription>
              Essas informações aparecerão nos relatórios e recibos gerados.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Garimpo *</Label>
                <div className="relative">
                  <Building2 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="name" 
                    name="name" 
                    required 
                    className="pl-8 bg-background border-border" 
                    placeholder="Ex: Garimpo Ouro Rico" 
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="document">CNPJ / CPF</Label>
                <div className="relative">
                  <FileText className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="document" 
                    name="document" 
                    className="pl-8 bg-background border-border" 
                    placeholder="Somente números" 
                    value={formData.document}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone / WhatsApp</Label>
              <div className="relative">
                <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="phone" 
                  name="phone" 
                  className="pl-8 bg-background border-border" 
                  placeholder="(00) 00000-0000" 
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Localização
              </h3>
              
               <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço Completo</Label>
                    <Input 
                      id="address" 
                      name="address" 
                      className="bg-background border-border" 
                      placeholder="Rua, Número, Bairro" 
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input 
                        id="city" 
                        name="city" 
                        className="bg-background border-border" 
                        placeholder="Nome da Cidade" 
                        value={formData.city}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado (UF)</Label>
                      <Input 
                        id="state" 
                        name="state" 
                        className="bg-background border-border" 
                        placeholder="Ex: MT, PA, AM" 
                        maxLength={2}
                        value={formData.state}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
               </div>
            </div>

          </CardContent>
          <div className="p-6 pt-0 flex justify-end">
            <Button type="submit" disabled={saving || loading} className="bg-[#D4AF37] text-black hover:bg-[#FDB931] w-full sm:w-auto">
              {saving ? (
                <>Salvando...</>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
