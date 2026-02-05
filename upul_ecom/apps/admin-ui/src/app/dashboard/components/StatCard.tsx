"use client";

import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import CountUp from "./CountUp";

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

export default function StatCard({
  title,
  value,
  prefix = "",
  icon: Icon,
  trend,
  data,
  isActive,
  onClick,
}: StatCardProps) {
  const isPositive = trend >= 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-[2rem] cursor-pointer transition-all duration-300 border group",
        // Mobile: Padding 4 (16px), Desktop: Padding 6 (24px)
        "p-7 sm:px-7 sm:py-9",
        isActive
          ? "bg-blue-600 border-blue-500 shadow-xl shadow-blue-200/50 dark:shadow-none -translate-y-1"
          : "bg-white border-gray-100 hover:border-blue-100 dark:bg-slate-950 dark:border-slate-800",
      )}
    >
      {/* Background Decor */}
      <div
        className={cn(
          "absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl transition-opacity duration-500 pointer-events-none",
          isActive ? "bg-white/10" : "bg-blue-500/5 dark:bg-blue-500/10",
        )}
      />

      {/* LAYOUT CONTAINER
          Mobile: Flex Column + Centered Items
          Desktop: Block + Left Aligned
      */}
      <div className="flex flex-col sm:block items-center sm:items-stretch text-center sm:text-left h-full relative z-10 bottom-2">
        
        {/* 1. Header Row (Icon & Trend) */}
        {/* Mobile: Center items. Desktop: Space between */}
        <div className="flex justify-center sm:justify-between items-center w-full mb-3 sm:mb-6 gap-3">
          {/* Icon */}
          <div
            className={cn(
              "p-2.5 sm:p-3 rounded-2xl transition-all duration-300 border shadow-sm",
              isActive
                ? "bg-white/20 border-white/10 text-white"
                : "bg-gray-50 border-gray-100 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300",
            )}
          >
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
          </div>

          {/* Trend Badge */}
          <div
            className={cn(
              "flex items-center text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border shadow-sm backdrop-blur-md",
              isActive
                ? "bg-white text-emerald-600"
                : "bg-white border-gray-100 dark:bg-slate-900 dark:border-slate-800",
            )}
          >
            <span
              className={cn(
                "flex items-center",
                isPositive ? "text-emerald-500" : "text-rose-500",
              )}
            >
              {isPositive ? (
                <ArrowUpRight size={12} className="mr-0.5 stroke-[3px]" />
              ) : (
                <ArrowDownRight size={12} className="mr-0.5 stroke-[3px]" />
              )}
              {Math.abs(trend)}%
            </span>
          </div>
        </div>

        {/* 2. Value Section */}
        {/* 👇 FIXED: Added 'items-center' to force text to center on mobile */}
        <div className="flex flex-col items-center sm:items-start mb-6 sm:mb-0">
          <span
            className={cn(
              "text-xs sm:text-sm font-semibold mb-0.5 sm:mb-1 transition-colors truncate",
              isActive ? "text-blue-100" : "text-slate-400",
            )}
          >
            {title}
          </span>
          <h4
            className={cn(
              "text-xl sm:text-3xl font-extrabold tracking-tight truncate",
              isActive ? "text-white" : "text-slate-800 dark:text-white",
            )}
          >
            <CountUp value={value} prefix={prefix} />
          </h4>
        </div>
      </div>

      {/* 3. Graph
          Mobile: Centered Bottom (left-1/2 -translate-x-1/2), 50% width
          Desktop: Bottom Right, right-0
      */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1/2 h-10 sm:h-16 sm:w-[140px] sm:left-auto sm:right-0 sm:bottom-4 sm:translate-x-0 pointer-events-none">
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