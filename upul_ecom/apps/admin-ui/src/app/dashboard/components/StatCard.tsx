"use client";

import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import CountUp from "./CountUp"; // Ensure you have this component or use standard text

interface StatCardProps {
  title: string;
  value: number;
  prefix?: string;
  icon: LucideIcon;
  trend: number;
  data: any[];
  isActive: boolean;
  onClick: () => void;
}

export default function StatCard({ title, value, prefix = "", icon: Icon, trend, data, isActive, onClick }: StatCardProps) {
  const isPositive = trend >= 0;

  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-[2.5rem] px-6 py-10 cursor-pointer transition-all duration-300 border group",
        // LIGHT MODE: Keep the nice shadows and gradients
        // DARK MODE: Removed 'shadow-2xl', relying on 'border-slate-800' for a clean flat look
        isActive 
          ? "bg-blue-600 border-blue-500 shadow-xl shadow-blue-200/50 dark:shadow-none -translate-y-1" 
          : "bg-white border-gray-100 hover:border-blue-100 hover:shadow-lg hover:shadow-gray-100/50 hover:-translate-y-1 dark:bg-slate-950 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:shadow-none"
      )}
    >
      {/* Background Decor */}
      <div className={cn(
        "absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl transition-opacity duration-500 pointer-events-none",
        isActive ? "bg-white/10" : "bg-blue-500/5 dark:bg-blue-500/10"
      )} />

      {/* Header */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={cn(
          "p-3 rounded-2xl transition-all duration-300 border shadow-sm",
          isActive 
            ? "bg-white/20 border-white/10 text-white backdrop-blur-md" 
            : "bg-gray-50 border-gray-100 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
        )}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
        
        <div className={cn(
          "flex items-center text-xs font-bold px-3 py-1.5 rounded-full border shadow-sm backdrop-blur-md",
          isActive 
            ? "bg-white text-emerald-600 border-white/20" 
            : "bg-white border-gray-100 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
        )}>
          <span className={cn("flex items-center", isPositive ? "text-emerald-500" : "text-rose-500")}>
            {isPositive ? <ArrowUpRight size={14} className="mr-1 stroke-[3px]" /> : <ArrowDownRight size={14} className="mr-1 stroke-[3px]" />}
            {Math.abs(trend)}%
          </span>
        </div>
      </div>

      {/* Value */}
      <div className="flex flex-col relative z-10">
        <span className={cn(
          "text-sm font-semibold mb-1 transition-colors",
          isActive ? "text-blue-100" : "text-slate-400"
        )}>
          {title}
        </span>
        <h4 className={cn(
          "text-3xl font-extrabold tracking-tight",
          isActive ? "text-white" : "text-slate-800 dark:text-white"
        )}>
          {/* If you don't have CountUp, just use {prefix}{value.toLocaleString()} */}
          <CountUp value={value} prefix={prefix} />
        </h4>
      </div>

      {/* Graph */}
      <div className="absolute bottom-4 right-0 lg:w-[145px] w-1/2 h-16 pointer-events-none">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={isActive ? "rgba(255,255,255,0.6)" : "#3b82f6"} 
              strokeWidth={3} 
              dot={false}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}