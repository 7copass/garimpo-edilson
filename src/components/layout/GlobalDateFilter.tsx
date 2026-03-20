"use client";

import * as React from "react";
import { format, subDays, startOfMonth, endOfMonth, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useStore, DateFilterType } from "@/store/useStore";

export function GlobalDateFilter() {
  const dateFilter = useStore(state => state.dateFilter);
  const setDateFilter = useStore(state => state.setDateFilter);
  const [isOpen, setIsOpen] = React.useState(false);

  // Controle local do calendário quando customizado
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: new Date(dateFilter.startDate),
    to: new Date(dateFilter.endDate),
  });

  const handleSelectPreset = (type: DateFilterType) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    let start = new Date();
    let end = new Date();

    switch (type) {
      case "today":
        start = today;
        end = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1);
        break;
      case "last7":
        start = subDays(today, 6);
        end = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1);
        break;
      case "last30":
        start = subDays(today, 29);
        end = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1);
        break;
      case "thisMonth":
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
    }

    const isoStart = start.toISOString();
    const isoEnd = end.toISOString();
    
    setDateFilter({
      type,
      startDate: isoStart,
      endDate: isoEnd,
    });
    
    setDateRange({ from: start, to: end });
    setIsOpen(false);
  };

  const applyCustomRange = () => {
    if (dateRange?.from && dateRange?.to) {
      // Ajusta para cobrir o dia inteiro da data final
      const end = new Date(dateRange.to);
      end.setHours(23, 59, 59, 999);

      setDateFilter({
        type: "custom",
        startDate: dateRange.from.toISOString(),
        endDate: end.toISOString(),
      });
      setIsOpen(false);
    }
  };

  const getLabel = () => {
    switch (dateFilter.type) {
      case "today": return "Hoje";
      case "last7": return "Últimos 7 dias";
      case "last30": return "Últimos 30 dias";
      case "thisMonth": return "Este mês";
      case "custom":
        const from = new Date(dateFilter.startDate);
        const to = new Date(dateFilter.endDate);
        if (isSameDay(from, to)) {
          return format(from, "dd/MM/yyyy");
        }
        return `${format(from, "dd/MM")} - ${format(to, "dd/MM")}`;
      case "all":
      default:
        return "Todo o período";
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger className="inline-flex w-[240px] items-center justify-between rounded-md border border-input bg-background hover:bg-muted/50 px-4 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
        <div className={cn("flex items-center", !dateFilter && "text-muted-foreground")}>
          <CalendarIcon className="mr-2 h-4 w-4 text-emerald-500" />
          {getLabel()}
        </div>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 flex flex-col md:flex-row shadow-xl border-border bg-card" align="start">
        <div className="flex flex-col border-b md:border-b-0 md:border-r border-border p-2 gap-1 min-w-[150px]">
          <Button 
            variant="ghost" 
            className={`justify-start ${dateFilter.type === 'today' ? 'bg-muted font-bold text-emerald-500' : ''}`}
            onClick={() => handleSelectPreset("today")}
          >
            Hoje
          </Button>
          <Button 
            variant="ghost" 
            className={`justify-start ${dateFilter.type === 'last7' ? 'bg-muted font-bold text-emerald-500' : ''}`}
            onClick={() => handleSelectPreset("last7")}
          >
            Últimos 7 dias
          </Button>
          <Button 
            variant="ghost" 
            className={`justify-start ${dateFilter.type === 'last30' ? 'bg-muted font-bold text-emerald-500' : ''}`}
            onClick={() => handleSelectPreset("last30")}
          >
            Últimos 30 dias
          </Button>
          <Button 
            variant="ghost" 
            className={`justify-start ${dateFilter.type === 'thisMonth' ? 'bg-muted font-bold text-emerald-500' : ''}`}
            onClick={() => handleSelectPreset("thisMonth")}
          >
            Este mês
          </Button>
          <Button 
            variant="ghost" 
            className={`justify-start ${dateFilter.type === 'all' ? 'bg-muted font-bold text-emerald-500' : ''}`}
            onClick={() => handleSelectPreset("all")}
          >
            Todo o período
          </Button>
        </div>
        
        <div className="p-2 space-y-4">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={1}
            locale={ptBR}
            className="rounded-md"
          />
          <div className="flex justify-end gap-2 px-2 pb-2">
            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button 
              size="sm" 
              className="bg-emerald-500 text-white hover:bg-emerald-600"
              disabled={!dateRange?.from || !dateRange?.to}
              onClick={applyCustomRange}
            >
              Aplicar Filtro
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
