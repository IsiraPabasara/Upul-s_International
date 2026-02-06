"use client";

import { useMemo } from "react";
import { Phone, CheckCircle2, PackageOpen, Truck, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsProps {
  orders: any[];
  currentFilter: string;
  onFilterChange: (status: string) => void;
}

export default function OrderStats({ orders, currentFilter, onFilterChange }: StatsProps) {
  
  const safeOrders = orders || [];

  const statsConfig = useMemo(() => {
    return [
      {
        id: "PENDING",
        label: "New Requests",
        statuses: ["PENDING"],
        icon: Phone,
        description: "Needs Verification",
        activeBg: "bg-blue-50 dark:bg-blue-900/20",
        activeBorder: "border-blue-200 dark:border-blue-800",
        activeText: "text-blue-700 dark:text-blue-400",
        iconBg: "bg-blue-100 dark:bg-blue-900/40",
        glow: "bg-blue-400",
      },
      {
        id: "CONFIRMED",
        label: "Confirmed",
        statuses: ["CONFIRMED"],
        icon: CheckCircle2,
        description: "Approved Orders",
        activeBg: "bg-emerald-50 dark:bg-emerald-900/20",
        activeBorder: "border-emerald-200 dark:border-emerald-800",
        activeText: "text-emerald-700 dark:text-emerald-400",
        iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
        glow: "bg-emerald-400",
      },
      {
        id: "PROCESSING",
        label: "Processing",
        statuses: ["PROCESSING"],
        icon: PackageOpen,
        description: "Packing & Printing",
        activeBg: "bg-amber-50 dark:bg-amber-900/20",
        activeBorder: "border-amber-200 dark:border-amber-800",
        activeText: "text-amber-700 dark:text-amber-400",
        iconBg: "bg-amber-100 dark:bg-amber-900/40",
        glow: "bg-amber-400",
      },
      {
        id: "SHIPPED",
        label: "In Transit",
        statuses: ["SHIPPED"],
        icon: Truck,
        description: "With Courier",
        activeBg: "bg-purple-50 dark:bg-purple-900/20",
        activeBorder: "border-purple-200 dark:border-purple-800",
        activeText: "text-purple-700 dark:text-purple-400",
        iconBg: "bg-purple-100 dark:bg-purple-900/40",
        glow: "bg-purple-400",
      },
      {
        id: "ISSUES",
        label: "Issues",
        statuses: ["CANCELLED", "RETURNED"],
        icon: AlertCircle,
        description: "Returns / Failed",
        activeBg: "bg-rose-50 dark:bg-rose-900/20",
        activeBorder: "border-rose-200 dark:border-rose-800",
        activeText: "text-rose-700 dark:text-rose-400",
        iconBg: "bg-rose-100 dark:bg-rose-900/40",
        glow: "bg-rose-400",
      },
    ];
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-6 mb-8">
      {statsConfig.map((card) => {
        const isActive = currentFilter === card.id;
        const Icon = card.icon;
        
        // Simple Count Calculation
        const currentCount = safeOrders.filter(o => card.statuses.includes(o.status)).length;

        return (
          <div
            key={card.id}
            onClick={() => onFilterChange(isActive ? "ALL" : card.id)}
            className={cn(
              "relative overflow-hidden p-4 sm:p-5 rounded-[2rem] border cursor-pointer transition-all duration-300 group select-none",
              isActive
                ? `${card.activeBg} ${card.activeBorder} shadow-md scale-[1.02]`
                : "bg-white border-gray-100 hover:border-blue-100 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700 hover:shadow-lg hover:-translate-y-1"
            )}
          >
            {/* Glow */}
            <div className={cn(
               "absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none",
               card.glow
            )} />

            <div className="relative z-10 flex flex-col h-full justify-between">
              
              {/* Header: Icon & Active Check */}
              <div className="flex justify-between items-start mb-4">
                <div className={cn(
                  "p-2 sm:p-2.5 rounded-2xl transition-colors",
                  isActive 
                    ? `${card.iconBg} ${card.activeText}` 
                    : "bg-gray-50 text-slate-500 group-hover:bg-white group-hover:shadow-sm dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-slate-700"
                )}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
                </div>
                
                {isActive && (
                   <div className={cn("flex items-center gap-1 text-[10px] font-extrabold px-2 py-1 rounded-full", card.iconBg, card.activeText)}>
                     <CheckCircle size={10} /> Active
                   </div>
                )}
              </div>
              
              {/* Main Content */}
              <div>
                <h4 className={cn("text-2xl sm:text-3xl font-extrabold transition-colors", isActive ? "text-slate-800 dark:text-white" : "text-slate-700 dark:text-slate-200")}>
                  {currentCount}
                </h4>
                <p className={cn("text-xs font-bold mt-1 uppercase tracking-wide truncate", isActive ? card.activeText : "text-slate-500 dark:text-slate-500")}>
                  {card.label}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 font-medium truncate opacity-80">
                  {card.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}