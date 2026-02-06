"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axiosInstance";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  Loader2, Phone, MapPin, CheckCircle, Truck, XCircle, ArrowLeft, 
  PackageCheck, CreditCard, Banknote, Copy, Calendar, Check,
  AlertTriangle 
} from "lucide-react";
import toast from "react-hot-toast";

import OrderTimeline from "../components/OrderTimeline"; 

// Internal Copy Button
const CopyButton = ({ text, label, className = "" }: { text: string, label: string, className?: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button 
      onClick={handleCopy}
      className={`transition-all duration-200 flex items-center justify-center ${className} ${copied ? "text-emerald-500 scale-110" : "text-slate-400 hover:text-blue-600"}`}
      title={`Copy ${label}`}
    >
      {copied ? <Check size={16} strokeWidth={3} /> : <Copy size={16} />}
    </button>
  );
};

export default function AdminOrderDetails() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  
  // States
  const [trackingInput, setTrackingInput] = useState("");
  const [isPhoneCopied, setIsPhoneCopied] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ["admin-order", id],
    queryFn: async () => (await axiosInstance.get(`/api/orders/admin/${id}`)).data,
  });

  const statusMutation = useMutation({
    mutationFn: async ({ status, tracking }: { status: string; tracking?: string }) => {
      await axiosInstance.patch(`/api/orders/admin/${id}/status`, { status, trackingNumber: tracking });
    },
    onSuccess: () => {
      toast.success("Order status updated!");
      queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
      setTrackingInput("");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Update failed"),
  });

  const handleUpdateStatus = (newStatus: string) => {
    if (newStatus === "SHIPPED" && !trackingInput && !order.trackingNumber) {
      toast.error("Please enter a Domex tracking number first");
      return;
    }
    statusMutation.mutate({ status: newStatus, tracking: trackingInput });
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950"><Loader2 className="animate-spin text-blue-600 h-10 w-10" /></div>;
  if (!order) return <div className="p-10 text-center">Order not found</div>;

  // Logic: Order is "Terminated" if Cancelled, Returned, or Delivered
  const isOrderTerminated = ['CANCELLED', 'RETURNED', 'DELIVERED'].includes(order.status);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 p-4 sm:p-6 lg:p-10 font-sans transition-colors">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <Link href="/dashboard/orders" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">
            <ArrowLeft size={16} /> Back to Orders
          </Link>
        </div>

        {/* Title & Info */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
               <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Order #{order.orderNumber}</h1>
               <div className="bg-gray-100 dark:bg-slate-900 p-1.5 rounded-lg"><CopyButton text={order.orderNumber} label="Order ID" /></div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center gap-2">
              <Calendar size={14}/> Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Current Status</span>
            <span className={`text-sm sm:text-base font-extrabold px-4 py-1.5 rounded-full border ${order.status === 'DELIVERED' ? 'border-green-200 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' : order.status === 'CANCELLED' ? 'border-red-200 text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' : order.status === 'RETURNED' ? 'border-orange-200 text-orange-700 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800' : 'border-slate-200 text-slate-700 bg-white dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700'}`}>
               {order.status}
            </span>
          </div>
        </div>

        <OrderTimeline status={order.status} date={order.updatedAt} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            
            {/* LEFT COLUMN: Info */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Items Card */}
                <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-800">
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6">Items Ordered</h2>
                    <div className="space-y-6">
                        {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-4 sm:gap-6 border-b border-gray-50 dark:border-slate-800 pb-6 last:border-0 last:pb-0">
                                <div className="w-20 h-24 bg-gray-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700 shrink-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-slate-800 dark:text-slate-200 text-lg">{item.name}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Qty: <span className="font-bold">{item.quantity}</span> {item.size && `| Size: ${item.size}`}</p>
                                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-2">LKR {item.price.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            {order.paymentMethod === 'PAYHERE' ? (
                                <span className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-800"><CreditCard size={16} /> PAID ONLINE</span>
                            ) : (
                                <span className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800"><Banknote size={16} /> CASH ON DELIVERY</span>
                            )}
                        </div>
                        <div className="text-right">
                            <span className="text-xs text-slate-400 uppercase font-bold block mb-0.5">Total Amount</span>
                            <span className="font-black text-2xl text-slate-900 dark:text-white">LKR {order.totalAmount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-800">
                       <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2"><MapPin size={14} /> Shipping Address</h3>
                          <CopyButton text={order.shippingAddress.addressLine} label="Address" />
                       </div>
                       <div className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                           <p className="font-bold text-base text-slate-900 dark:text-white mb-2">{order.shippingAddress.firstname} {order.shippingAddress.lastname}</p>
                           <p>{order.shippingAddress.addressLine}, {order.shippingAddress.city}</p>
                       </div>
                   </div>
                   <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                           <h3 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2"><Phone size={14} /> Contact Details</h3>
                           <CopyButton text={order.shippingAddress.phoneNumber} label="Phone Number" />
                        </div>
                        <div 
                            className={`flex-1 p-5 rounded-2xl flex flex-col justify-center items-center text-center group cursor-pointer transition-all select-none ${isPhoneCopied ? "bg-emerald-50 border border-emerald-100 dark:bg-emerald-900/20" : "bg-yellow-50 border border-yellow-100 hover:bg-yellow-100 dark:bg-yellow-900/10 dark:hover:bg-yellow-900/20"}`}
                             onClick={() => { 
                                 navigator.clipboard.writeText(order.shippingAddress.phoneNumber); 
                                 toast.success("Phone number copied!"); 
                                 setIsPhoneCopied(true); setTimeout(() => setIsPhoneCopied(false), 2000);
                             }}
                        >
                             {isPhoneCopied ? (
                                 <div className="animate-in fade-in zoom-in duration-200">
                                     <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                                     <p className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">Copied!</p>
                                 </div>
                             ) : (
                                 <>
                                     <p className="text-xs text-yellow-700 dark:text-yellow-500 font-bold mb-2">Click to Copy</p>
                                     <p className="text-2xl font-black text-slate-900 dark:text-white tracking-wide">{order.shippingAddress.phoneNumber}</p>
                                 </>
                             )}
                        </div>
                   </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Management */}
            <div className="space-y-6">
                {!isOrderTerminated ? (
                    <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-slate-800 sticky top-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Manage Status</h2>
                        <div className="space-y-3">
                            {order.status === 'PENDING' && <button onClick={() => handleUpdateStatus('CONFIRMED')} disabled={statusMutation.isPending} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold flex justify-center gap-2">{statusMutation.isPending ? <Loader2 className="animate-spin"/> : <CheckCircle />} Confirm Order</button>}
                            {order.status === 'CONFIRMED' && <button onClick={() => handleUpdateStatus('PROCESSING')} disabled={statusMutation.isPending} className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold flex justify-center gap-2"><Loader2 /> Start Processing</button>}
                            {(order.status === 'PROCESSING' || order.status === 'CONFIRMED') && (
                                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1">Domex Tracking ID</label>
                                    <input type="text" placeholder="Enter Tracking Number..." value={trackingInput} onChange={(e) => setTrackingInput(e.target.value)} className="w-full p-3 bg-white dark:bg-slate-900 border border-gray-200 rounded-xl mb-3 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                                    <button onClick={() => handleUpdateStatus('SHIPPED')} disabled={statusMutation.isPending} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold flex justify-center gap-2"><Truck /> Mark as Shipped</button>
                                </div>
                            )}
                            {order.status === 'SHIPPED' && <button onClick={() => handleUpdateStatus('DELIVERED')} disabled={statusMutation.isPending} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold flex justify-center gap-2"><PackageCheck /> Mark as Delivered</button>}
                            <div className="pt-6 mt-6 border-t border-gray-100 dark:border-slate-800 space-y-3">
                                 {['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.status) && (
                                    <button onClick={() => { if(confirm('Cancel Order?')) handleUpdateStatus('CANCELLED'); }} className="w-full py-3 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-xl border border-transparent flex justify-center gap-2"><XCircle size={16} /> Cancel Order</button>
                                 )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-gray-200 dark:border-slate-800 text-center sticky top-6">
                        <AlertTriangle size={32} className="mx-auto text-gray-400 mb-3" />
                        <h3 className="font-bold text-gray-500">Order Closed</h3>
                        <p className="text-xs text-gray-400 mt-1">This order is {order.status.toLowerCase()}. Actions are disabled.</p>
                    </div>
                )}
                {order.trackingNumber && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/30 text-center relative group">
                        <div className="absolute top-4 right-4"><CopyButton text={order.trackingNumber} label="Tracking ID" /></div>
                        <p className="text-emerald-800 dark:text-emerald-400 text-xs font-bold uppercase mb-2">Tracking Number</p>
                        <p className="text-2xl font-black text-emerald-900 dark:text-emerald-300 tracking-wider font-mono">{order.trackingNumber}</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}