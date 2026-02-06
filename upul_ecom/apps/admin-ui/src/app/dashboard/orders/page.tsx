"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axiosInstance";
import { useRouter, useSearchParams } from "next/navigation"; 
import { 
  Loader2, CreditCard, Banknote, FilterX, Search, 
  ChevronLeft, ChevronRight, X 
} from "lucide-react";

import OrderStats from "./components/OrderStats"; 

export default function AdminOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 1. GET FILTER FROM URL
  const filterStatus = searchParams.get("filter") || "ALL";
  
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/orders/admin");
      return res.data;
    },
  });

  // 2. HANDLE FILTER CHANGE
  const handleFilterChange = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status === "ALL") {
      params.delete("filter"); 
    } else {
      params.set("filter", status);
    }
    router.push(`?${params.toString()}`);
    setCurrentPage(1); 
    setSearchQuery(""); 
  };

  const processedOrders = orders?.filter((order: any) => {
    const matchesStatus = 
      filterStatus === "ALL" ? true :
      filterStatus === "ISSUES" ? ["CANCELLED", "RETURNED"].includes(order.status) :
      order.status === filterStatus;

    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shippingAddress.firstname.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil((processedOrders?.length || 0) / itemsPerPage);
  const paginatedOrders = processedOrders?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
      case "CONFIRMED": return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
      case "PROCESSING": return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800";
      case "SHIPPED": return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800";
      case "DELIVERED": return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
      case "CANCELLED": return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800";
      default: return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
    }
  };

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-blue-600 h-10 w-10" />
      </div>
    );

  return (
    <div className="p-4 sm:p-6 lg:p-10 bg-gray-50/50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Order Management</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage and verify customer orders</p>
          </div>
        </div>

        <OrderStats 
          orders={orders} 
          currentFilter={filterStatus} 
          onFilterChange={handleFilterChange} 
        />

        <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-xl shadow-slate-200/40 dark:shadow-none border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col min-h-[500px]">
          
          {/* HEADER ROW */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-slate-900 gap-4">
              
              {/* Left: Filter Label */}
              <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto">
                <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm sm:text-base whitespace-nowrap">
                  {filterStatus === 'ALL' ? 'All Recent Orders' : `${filterStatus.charAt(0) + filterStatus.slice(1).toLowerCase()} Orders`}
                </h3>
                
                <span className="text-xs font-semibold text-slate-400 bg-gray-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-gray-100 dark:border-slate-700 whitespace-nowrap">
                  {processedOrders?.length || 0}
                </span>

                {filterStatus !== "ALL" && (
                  <button 
                    onClick={() => handleFilterChange("ALL")}
                    className="flex items-center gap-1 text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-3 py-1 rounded-full hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors border border-rose-100 dark:border-rose-800"
                  >
                    <X size={12} strokeWidth={3} /> Clear
                  </button>
                )}
              </div>

              {/* Right: Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search Order ID..." 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); 
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-800">
                <tr>
                  {/* Always Visible */}
                  <th className="px-6 py-4 font-bold tracking-wider">Order ID</th>
                  
                  {/* Hidden on Mobile */}
                  <th className="px-6 py-4 font-bold tracking-wider hidden sm:table-cell">Customer</th>
                  <th className="px-6 py-4 font-bold tracking-wider hidden sm:table-cell">Total</th>
                  
                  {/* Always Visible */}
                  <th className="px-6 py-4 font-bold tracking-wider">Payment</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                  
                  {/* Action Column Removed */}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {paginatedOrders?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <FilterX size={48} className="mb-4 opacity-20"/>
                        <p className="font-medium">No orders found.</p>
                        <p className="text-xs opacity-70 mt-1">Try adjusting your search or filters.</p>
                        {(searchQuery || filterStatus !== "ALL") && (
                            <button 
                              onClick={() => { setSearchQuery(""); handleFilterChange("ALL"); }}
                              className="mt-4 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                            >
                              Reset All Filters
                            </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedOrders?.map((order: any) => (
                    <tr 
                      key={order.id} 
                      onClick={() => router.push(`/dashboard/orders/${order.id}`)} // 👈 Row Click Navigation
                      className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    >
                      {/* Order ID & Date */}
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          #{order.orderNumber}
                        </span>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      
                      {/* Customer (Hidden on Mobile) */}
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center font-bold text-xs border border-slate-200 dark:border-slate-700">
                             {order.shippingAddress.firstname.charAt(0)}
                           </div>
                           <div>
                             <p className="font-bold text-slate-700 dark:text-slate-200 text-xs sm:text-sm">
                               {order.shippingAddress.firstname} {order.shippingAddress.lastname}
                             </p>
                             <p className="text-[10px] text-slate-400">{order.email}</p>
                           </div>
                        </div>
                      </td>
                      
                      {/* Total (Hidden on Mobile) */}
                      <td className="px-6 py-4 font-extrabold text-slate-700 dark:text-slate-200 hidden sm:table-cell">
                        Rs. {order.totalAmount.toLocaleString()}
                      </td>

                      {/* Payment (Visible) */}
                      <td className="px-6 py-4">
                        {order.paymentMethod === "PAYHERE" ? (
                          <span className="flex items-center w-fit gap-1.5 text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-800">
                            <CreditCard size={12} /> <span className="hidden sm:inline">ONLINE</span>
                            {/* Shorten text on mobile if needed, or keep ONLINE */}
                          </span>
                        ) : (
                          <span className="flex items-center w-fit gap-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-800">
                            <Banknote size={12} /> COD
                          </span>
                        )}
                      </td>

                      {/* Status (Visible) */}
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ring-1 ring-inset ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>

                      {/* Action Column Removed */}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900">
              <span className="text-xs font-semibold text-slate-400">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-gray-200 dark:hover:border-slate-700 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-gray-200 dark:hover:border-slate-700 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}