import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

// Utilitário para formatar BRL
export const formatBRL = (value: number | string) => {
  const numericValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numericValue)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numericValue);
};

// Converte string BRL ("R$ 1.500,00") para Number (1500)
export const parseBRL = (value: string) => {
  if (!value) return 0;
  const numbersOnly = value.replace(/\D/g, "");
  return parseFloat(numbersOnly) / 100;
};

interface InputCurrencyProps extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
  value: number;
  onChange: (value: number) => void;
}

export function InputCurrency({ value, onChange, className, ...props }: InputCurrencyProps) {
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    // Sincroniza o prop value com o display interno (quando o valor muda de fora)
    if (value !== undefined) {
      setDisplayValue(formatBRL(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Ignora letras/caracteres especiais, mantendo só números
    const numbersOnly = inputValue.replace(/\D/g, "");
    
    // Converte para Number ("" -> 0, "1500" -> 15.00)
    const floatValue = numbersOnly ? parseFloat(numbersOnly) / 100 : 0;
    
    // Formata visualmente
    setDisplayValue(formatBRL(floatValue));
    
    // Dispara onChange repassando o Number para os forms
    onChange(floatValue);
  };

  return (
    <Input
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      className={className}
      {...props}
    />
  );
}
