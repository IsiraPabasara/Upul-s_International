'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/app/utils/axiosInstance';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Phone, MapPin, CheckCircle, Truck, XCircle, ArrowLeft, PackageCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminOrderDetails() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [trackingInput, setTrackingInput] = useState("");

  // 1. Fetch Order Data
  const { data: order, isLoading } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: async () => (await axiosInstance.get(`/api/orders/admin/${id}`)).data
  });

  // 2. Mutation to Update Status
  const statusMutation = useMutation({
    mutationFn: async ({ status, tracking }: { status: string, tracking?: string }) => {
       await axiosInstance.patch(`/api/orders/admin/${id}/status`, { 
         status, 
         trackingNumber: tracking 
       });
    },
    onSuccess: () => {
       toast.success("Order status updated!");
       queryClient.invalidateQueries({ queryKey: ['admin-order', id] });
       setTrackingInput(""); 
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Update failed")
  });

  const handleUpdateStatus = (newStatus: string) => {
     if (newStatus === 'SHIPPED' && !trackingInput && !order.trackingNumber) {
        toast.error("Please enter a Domex tracking number first");
        return;
     }
     statusMutation.mutate({ status: newStatus, tracking: trackingInput });
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!order) return <div>Order not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <Link href="/dashboard/orders" className="flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-6">
           <ArrowLeft size={16} /> Back to Orders
        </Link>

        {/* HEADER: ID and Status */}
        <div className="flex justify-between items-start mb-8">
            <div>
                <h1 className="text-3xl font-black text-gray-900">Order #{order.orderNumber}</h1>
                <p className="text-gray-500 text-sm mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div className="text-right">
                <span className="text-xs uppercase tracking-widest text-gray-500 font-bold block mb-1">Current Status</span>
                <span className={`text-xl font-bold px-4 py-1 rounded-lg inline-block border-2 
                    ${order.status === 'DELIVERED' ? 'border-green-600 text-green-600 bg-green-50' : 'border-black text-black'}`}>
                    {order.status}
                </span>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT: Order Info */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* 1. Items */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold mb-4">Items Ordered</h2>
                    <div className="space-y-4">
                        {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                <div className="w-16 h-20 bg-gray-100 rounded overflow-hidden">
                                    <img src={item.image} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="font-bold">{item.name}</p>
                                    <p className="text-sm text-gray-500">Qty: {item.quantity} {item.size && `| Size: ${item.size}`}</p>
                                    <p className="text-sm font-bold mt-1">LKR {item.price.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t flex justify-between items-center">
                        <span className="font-bold text-gray-600">Total Amount (COD)</span>
                        <span className="font-black text-xl">LKR {order.totalAmount.toLocaleString()}</span>
                    </div>
                </div>

                {/* 2. Customer & Shipping */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-xs font-bold uppercase text-gray-400 mb-2 flex items-center gap-2">
                           <MapPin size={14} /> Shipping Address
                        </h3>
                        <div className="text-sm text-gray-800">
                            <p className="font-bold">{order.shippingAddress.firstname} {order.shippingAddress.lastname}</p>
                            <p>{order.shippingAddress.addressLine}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                            <p className="mt-2 text-xs text-gray-400">Email: {order.email}</p>
                        </div>
                    </div>
                    <div>
                         <h3 className="text-xs font-bold uppercase text-gray-400 mb-2 flex items-center gap-2">
                           <Phone size={14} /> Contact Details
                        </h3>
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                             <p className="text-xs text-yellow-700 font-bold mb-1">Call this number to verify:</p>
                             <p className="text-xl font-black text-gray-900 tracking-wide">
                                {order.shippingAddress.phoneNumber}
                             </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT: Management Actions */}
            <div className="space-y-6">
                
                {/* STATUS CONTROLS */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold mb-6">Manage Order</h2>

                    <div className="space-y-3">
                        {/* Step 1: Confirm */}
                        {order.status === 'PENDING' && (
                            <button 
                                onClick={() => handleUpdateStatus('CONFIRMED')}
                                disabled={statusMutation.isPending}
                                className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={18} /> Confirm Order
                            </button>
                        )}

                        {/* Step 2: Processing */}
                        {order.status === 'CONFIRMED' && (
                             <button 
                                onClick={() => handleUpdateStatus('PROCESSING')}
                                disabled={statusMutation.isPending}
                                className="w-full py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 flex items-center justify-center gap-2"
                            >
                                <Loader2 size={18} /> Start Processing
                            </button>
                        )}

                        {/* Step 3: Ship (Domex) */}
                        {(order.status === 'PROCESSING' || order.status === 'CONFIRMED') && (
                            <div className="border-t pt-4 mt-2">
                                <label className="text-xs font-bold text-gray-500 mb-1 block">Domex Tracking Number</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter Tracking ID"
                                    value={trackingInput}
                                    onChange={(e) => setTrackingInput(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded mb-3 text-sm"
                                />
                                <button 
                                    onClick={() => handleUpdateStatus('SHIPPED')}
                                    disabled={statusMutation.isPending}
                                    className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 flex items-center justify-center gap-2"
                                >
                                    <Truck size={18} /> Mark as Shipped
                                </button>
                            </div>
                        )}

                        {/* Step 4: Mark Delivered */}
                        {order.status === 'SHIPPED' && (
                            <button 
                                onClick={() => handleUpdateStatus('DELIVERED')}
                                disabled={statusMutation.isPending}
                                className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2"
                            >
                                <PackageCheck size={18} /> Mark as Delivered
                            </button>
                        )}

                        {/* Step 5: Mark Returned (Refused by Customer) */}
                        {/* Can happen after Shipping or even after Delivery if they return it */}
                        {(order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
                            <button 
                                onClick={() => {
                                   if(confirm('Mark as Returned? This will restore stock quantities.')) handleUpdateStatus('RETURNED');
                                }}
                                disabled={statusMutation.isPending}
                                className="w-full py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 flex items-center justify-center gap-2"
                            >
                                <ArrowLeft size={18} /> Order Returned
                            </button>
                        )}

                        {/* Cancel Option */}
                        {/* Only allow cancel if not already completed/returned to avoid confusion */}
                        {['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.status) && (
                            <button 
                                onClick={() => {
                                   if(confirm('Cancel Order? This will restore stock quantities.')) handleUpdateStatus('CANCELLED');
                                }}
                                className="w-full py-3 mt-4 text-red-600 border border-red-200 rounded-lg font-bold hover:bg-red-50 flex items-center justify-center gap-2"
                            >
                                <XCircle size={18} /> Cancel Order
                            </button>
                        )}
                        
                        {/* Final States */}
                        {order.status === 'DELIVERED' && (
                            <div className="p-4 bg-green-50 text-green-800 rounded-lg text-center font-bold flex items-center justify-center gap-2">
                                <CheckCircle size={18} /> Delivered Successfully
                            </div>
                        )}
                        {order.status === 'RETURNED' && (
                            <div className="p-4 bg-orange-50 text-orange-800 rounded-lg text-center font-bold flex items-center justify-center gap-2">
                                <XCircle size={18} /> Order Returned (Restocked)
                            </div>
                        )}
                        {order.status === 'CANCELLED' && (
                            <div className="p-4 bg-red-50 text-red-800 rounded-lg text-center font-bold flex items-center justify-center gap-2">
                                <XCircle size={18} /> Order Cancelled (Restocked)
                            </div>
                        )}
                    </div>
                </div>

                {/* Display Tracking if Shipped */}
                {order.trackingNumber && (
                    <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                        <p className="text-green-800 text-xs font-bold uppercase mb-1">Tracking Number</p>
                        <p className="text-2xl font-black text-green-900">{order.trackingNumber}</p>
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
}