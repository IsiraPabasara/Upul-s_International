'use client';

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axiosInstance";
import { ChevronLeft, Package, Loader2, ArrowRight } from "lucide-react";

export default function UserOrdersPage() {
  
  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => (await axiosInstance.get('/api/orders/my-orders')).data
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'bg-green-100 text-green-700 border-green-200';
      case 'SHIPPED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'CANCELLED': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-yellow-50 text-yellow-700 border-yellow-100';
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-12 font-sans min-h-screen">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <Link href="/profile" className="p-2 hover:bg-gray-100 rounded-full transition">
           <ChevronLeft size={20} />
        </Link>
        <h1 className="text-2xl font-light uppercase tracking-[0.2em]">Order History</h1>
      </div>

      {/* Empty State */}
      {(!orders || orders.length === 0) ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-100">
           <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Package className="text-gray-300" />
           </div>
           <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
           <Link href="/shop" className="bg-black text-white px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition">
              Start Shopping
           </Link>
        </div>
      ) : (
        /* Orders List */
        <div className="space-y-4">
           {orders.map((order: any) => (
              <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow group">
                 <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    
                    {/* Left: Info */}
                    <div>
                       <div className="flex items-center gap-3 mb-1">
                          <span className="text-lg font-bold">#{order.orderNumber}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusColor(order.status)}`}>
                             {order.status}
                          </span>
                       </div>
                       <p className="text-xs text-gray-500">
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                       </p>
                    </div>

                    {/* Middle: Items Preview (Optional) */}
                    <div className="flex -space-x-2 overflow-hidden">
                       {order.items.slice(0, 3).map((item: any, i: number) => (
                          <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 overflow-hidden relative">
                             <img src={item.image} alt="item" className="w-full h-full object-cover" />
                          </div>
                       ))}
                       {order.items.length > 3 && (
                          <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-500">
                             +{order.items.length - 3}
                          </div>
                       )}
                    </div>

                    {/* Right: Total & Action */}
                    <div className="flex items-center gap-6">
                       <p className="text-sm font-bold">LKR {order.totalAmount.toLocaleString()}</p>
                       <Link 
                          href={`/profile/orders/${order.id}`}
                          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide bg-black text-white px-4 py-2 rounded-lg group-hover:bg-gray-800 transition"
                       >
                          View <ArrowRight size={14} />
                       </Link>
                    </div>

                 </div>
              </div>
           ))}
        </div>
      )}
    </div>
  );
}