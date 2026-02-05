"use client";

import { memo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Loader2 } from "lucide-react";

const COLORS = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"];

const renderCustomizedLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, value, name } = props;
  const RADIAN = Math.PI / 180;
  
  const radius = innerRadius + (outerRadius - innerRadius) * 2.1;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
  const midX = cx + (outerRadius + 20) * Math.cos(-midAngle * RADIAN);
  const midY = cy + (outerRadius + 20) * Math.sin(-midAngle * RADIAN);
  
  const textAnchor = x > cx ? "start" : "end";

  return (
    <g>
      <path d={`M${cx + outerRadius * Math.cos(-midAngle * RADIAN)},${cy + outerRadius * Math.sin(-midAngle * RADIAN)} L${midX},${midY} L${x},${y}`} stroke="#cbd5e1" fill="none" strokeWidth={1} />
      <circle cx={cx + outerRadius * Math.cos(-midAngle * RADIAN)} cy={cy + outerRadius * Math.sin(-midAngle * RADIAN)} r={2} fill="#3b82f6" stroke="none" />
      <text x={x} y={y} textAnchor={textAnchor} fill="#64748b" fontSize={11} fontWeight={500} dy={-10}>{name}</text>
      <text x={x} y={y} textAnchor={textAnchor} fill="#1e293b" fontSize={13} fontWeight={700} dy={10}>Rs. {value.toLocaleString()}</text>
    </g>
  );
};

interface Props {
  data: any[];
  periodTotal: number;
  periodTrend: number;
  lifetimeTotal: number;
  isLoading: boolean;
  timeRange: string;
}

const SalesCategoryChart = ({ 
  data, 
  periodTotal, 
  periodTrend, 
  lifetimeTotal, 
  isLoading, 
  timeRange 
}: Props) => {
  
  // 1️⃣ LOADING STATE: Hides chart, shows Spinner + Text
  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-sm text-slate-500 font-medium">Loading Categories...</p>
      </div>
    );
  }

  // 2️⃣ NO DATA STATE
  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-slate-400">
        <p className="text-sm">No sales data available.</p>
      </div>
    );
  }

  const isPositive = periodTrend >= 0;

  return (
    <div className="flex flex-col h-full relative animate-in fade-in zoom-in duration-500">
      
      {/* Center Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 pb-12">
        <span className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          {(periodTotal / 1000).toFixed(1)}k
        </span>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold mt-1 ${
          isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(periodTrend)}%
        </div>
        <span className="text-[10px] text-slate-400 font-medium uppercase mt-1">
          {timeRange} Sales
        </span>
      </div>

      {/* THE CHART */}
      <div className="flex-1 w-full min-h-[300px] -mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
              label={renderCustomizedLabel}
              labelLine={false}
              // 3️⃣ ANIMATION: Enabled (Re-runs when isLoading toggles)
              animationBegin={0}
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  className="stroke-white dark:stroke-slate-900 stroke-[2px] hover:opacity-80 transition-all duration-300 cursor-pointer"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-gray-100 dark:border-slate-800 pt-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 font-medium">Total Lifetime Revenue</p>
          <h4 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            Rs. {lifetimeTotal.toLocaleString()}
            <TrendingUp className="text-blue-500 h-4 w-4" />
          </h4>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Categories</p>
          <p className="text-sm font-bold text-slate-700 dark:text-gray-300">{data.length} Active</p>
        </div>
      </div>
    </div>
  );
};

export default memo(SalesCategoryChart);