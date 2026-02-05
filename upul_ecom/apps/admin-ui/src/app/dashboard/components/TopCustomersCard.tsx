"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axiosInstance";
import { Loader2, Trophy, Medal, User } from "lucide-react";
import CustomSelect from "./CustomSelect";

interface Customer {
  id: string;
  name: string;
  email: string;
  image: string;
  totalSpent: number;
  ordersCount: number;
}

export default function TopCustomersCard() {
  const [range, setRange] = useState("all_time");

  const { data: customers, isLoading } = useQuery({
    queryKey: ["top-customers", range],
    queryFn: async () =>
      (await axiosInstance.get(`/api/analytics/top-customers?range=${range}`))
        .data as Customer[],
    staleTime: 1000 * 60 * 5,
  });

  const rangeOptions = [
    { label: "All Time", value: "all_time" },
    { label: "This Week", value: "weekly" },
    { label: "This Month", value: "monthly" },
  ];

  const getRankIcon = (index: number) => {
    if (index === 0) return <div className="p-2 bg-yellow-100 text-yellow-600 rounded-full"><Trophy size={18} fill="currentColor" /></div>; // Gold
    if (index === 1) return <div className="p-2 bg-gray-100 text-slate-500 rounded-full"><Medal size={18} /></div>; // Silver
    if (index === 2) return <div className="p-2 bg-orange-50 text-orange-600 rounded-full"><Medal size={18} /></div>; // Bronze
    return <div className="w-8 h-8 flex items-center justify-center font-bold text-slate-400">#{index + 1}</div>;
  };

  return (
    // Height matches the Top Products card (approx h-[700px])
    <div className="w-full bg-white dark:bg-slate-950 rounded-[2.5rem] p-6 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col h-[700px]">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">Top Buyers</h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Your most loyal customers</p>
        </div>
        <div className="scale-90 origin-right">
          <CustomSelect
            value={range}
            onChange={setRange}
            options={rangeOptions}
          />
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
          </div>
        ) : !customers || customers.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <User className="opacity-20 mb-3" size={48} />
            <p className="text-sm font-medium">No customer data yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {customers.map((customer, index) => (
              <div
                key={customer.id}
                className="flex items-center gap-4 p-4 rounded-3xl bg-gray-50 dark:bg-slate-900 border border-transparent hover:border-blue-100 dark:hover:border-slate-700 transition-all group"
              >
                {/* Rank */}
                <div className="flex-shrink-0">
                   {getRankIcon(index)}
                </div>

                {/* Avatar / Initials */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-lg font-bold text-blue-600 shadow-sm border border-gray-100 dark:border-slate-700">
                  {customer.image ? (
                     <img src={customer.image} alt={customer.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                     customer.name.charAt(0).toUpperCase()
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                    {customer.name}
                  </h4>
                  <p className="text-xs text-slate-400 truncate font-medium">
                    {customer.email}
                  </p>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <p className="font-extrabold text-slate-900 dark:text-white">
                    Rs. {(customer.totalSpent / 1000).toFixed(1)}k
                  </p>
                  <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md inline-block mt-1">
                    {customer.ordersCount} Orders
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}