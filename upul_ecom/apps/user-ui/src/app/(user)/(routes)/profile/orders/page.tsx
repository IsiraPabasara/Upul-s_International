'use client';

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axiosInstance";
import { ChevronLeft, ArrowRight } from "lucide-react";

export default function UserOrdersPage() {
  
  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => (await axiosInstance.get('/api/orders/my-orders')).data
  });

  const getStatusStyle = (status: string) => {
    switch(status) {
        case 'DELIVERED': return 'bg-green-50 text-green-700 border-green-200';
        case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-200';
        case 'SHIPPED': return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'RETURNED': return 'bg-orange-50 text-orange-700 border-orange-200';
        default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-xs uppercase tracking-[0.3em] font-bold">Loading Orders...</div>;

  return (
    <div className="w-full min-h-screen bg-white font-outfit pb-32">
      {/* Restored Original Max Width */}
      <div className="max-w-5xl mx-auto px-6 pt-20">
        
        <Link href="/profile" className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-gray-500 hover:text-black transition-colors mb-12">
          <ChevronLeft size={16} /> Back to Dashboard
        </Link>

        {/* Restored Original Header Sizing */}
        <div className="flex items-end justify-between mb-12 border-b border-black pb-8">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Order History</h1>
            <p className="text-sm font-bold text-gray-400">{orders?.length || 0} Orders</p>
        </div>

        {(!orders || orders.length === 0) ? (
          <div className="py-32 text-center border-2 border-dashed border-gray-100 rounded-lg">
             <p className="text-base text-gray-400 mb-8 uppercase tracking-widest">You haven't placed any orders yet</p>
             <Link href="/shop" className="inline-block border-b-2 border-black text-xs font-bold uppercase tracking-[0.2em] pb-2 hover:text-gray-500 hover:border-gray-500 transition-colors">
               Start Shopping
             </Link>
          </div>
        ) : (
          <div className="space-y-8">
             {orders.map((order: any) => (
                <Link href={`/profile/orders/${order.id}`} key={order.id} className="group block">
                   {/* Card: Original padding (p-8) but consistent border/shadow */}
                   <div className="border border-gray-200 p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 hover:border-black transition-all duration-500 bg-white hover:shadow-xl hover:shadow-gray-100/50">
                      
                      {/* Left: Info Section */}
                      <div className="flex flex-col gap-2">
                         <div className="flex items-center gap-4">
                            <span className="text-xl font-bold font-mono tracking-tight text-black">#{order.orderNumber}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-[0.1em] px-3 py-1 border rounded-sm ${getStatusStyle(order.status)}`}>
                                {order.status}
                            </span>
                         </div>
                         <p className="text-sm text-gray-400 uppercase tracking-wide">
                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                         </p>
                      </div>

                      {/* Right: Images + Price 
                          MOBILE FIX: 'justify-between' spreads content across width, 
                          'gap-4' prevents overflow, 'w-full' ensures it takes full mobile width. 
                      */}
                      <div className="flex items-center justify-between md:justify-end gap-4 md:gap-16 w-full md:w-auto">
                         
                         {/* Image Stack */}
                         <div className="flex -space-x-4">
                            {order.items.slice(0, 3).map((item: any, i: number) => (
                               // MOBILE FIX: w-12 (48px) on mobile, w-14 (56px) on desktop to fit 3 items + price
                               <div key={i} className="w-12 h-12 md:w-14 md:h-14 rounded-full border-4 border-white bg-gray-50 overflow-hidden relative shadow-sm shrink-0">
                                  <img src={item.image} alt="item" className="w-full h-full object-cover" />
                               </div>
                            ))}
                            {order.items.length > 3 && (
                               <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                                  +{order.items.length - 3}
                               </div>
                            )}
                         </div>

                         {/* Price & Action */}
                         <div className="text-right shrink-0">
                            <p className="text-lg font-bold mb-2 text-black">LKR {order.totalAmount.toLocaleString()}</p>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold flex items-center justify-end gap-2 text-gray-400 group-hover:text-black transition-colors">
                                Details <ArrowRight size={12} />
                            </span>
                         </div>
                      </div>

                   </div>
                </Link>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}