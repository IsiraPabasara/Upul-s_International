'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/app/utils/axiosInstance';
import { Loader2, Package, CheckCircle, Truck, Clock, MapPin, ChevronLeft, XCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function UserOrderDetailsPage() {
  const { id } = useParams();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['my-order', id],
    queryFn: async () => (await axiosInstance.get(`/api/orders/my-orders/${id}`)).data
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">Order not found</p>
        <Link href="/profile/orders" className="underline">Back to History</Link>
    </div>
  );

  // --- LOGIC TO HANDLE CANCELLED / RETURNED STATUS ---
  const isCancelled = order.status === 'CANCELLED';
  const isReturned = order.status === 'RETURNED';

  // Define steps dynamically based on status
  let steps = [
      { id: 'PENDING', label: 'Placed', icon: Clock },
      { id: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle },
      { id: 'PROCESSING', label: 'Processing', icon: Package },
      { id: 'SHIPPED', label: 'Shipped', icon: Truck },
      { id: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
  ];

  // If Cancelled, replace the steps with a "Cancelled" flow
  if (isCancelled) {
      steps = [
          { id: 'PENDING', label: 'Placed', icon: Clock },
          { id: 'CANCELLED', label: 'Cancelled', icon: XCircle },
      ];
  }

  // If Returned, add "Returned" step at the end
  if (isReturned) {
      steps = [
          { id: 'PENDING', label: 'Placed', icon: Clock },
          { id: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle },
          { id: 'SHIPPED', label: 'Shipped', icon: Truck },
          { id: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
          { id: 'RETURNED', label: 'Returned', icon: ArrowLeft },
      ];
  }

  // Find current step index
  let currentStepIndex = steps.findIndex(s => s.id === order.status);
  
  // Fallback for intermediate steps if status doesn't match exactly (e.g. if 'PROCESSING' but timeline shows 'CANCELLED')
  if (currentStepIndex === -1) {
      if (order.status === 'DELIVERED') currentStepIndex = steps.findIndex(s => s.id === 'DELIVERED');
      else if (isCancelled) currentStepIndex = 1; // Force to Cancelled step
      else if (isReturned) currentStepIndex = 4; // Force to Returned step
      else currentStepIndex = 0;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 md:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Nav */}
        <Link href="/profile/orders" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-8 transition">
           <ChevronLeft size={16} /> Back to Order History
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-black text-gray-900">Order #{order.orderNumber}</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Placed on {new Date(order.createdAt).toLocaleString()}
                </p>
            </div>
            
            <div className="text-right">
                {order.trackingNumber && (
                    <div className="bg-white px-4 py-2 rounded border border-gray-200 shadow-sm mb-2 inline-block">
                        <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">Domex Tracking</p>
                        <p className="font-mono font-bold text-lg">{order.trackingNumber}</p>
                    </div>
                )}
                {/* Status Badge */}
                <div className={`px-4 py-1.5 rounded-lg text-sm font-bold inline-block border
                    ${isCancelled ? 'bg-red-100 text-red-700 border-red-200' : 
                      isReturned ? 'bg-orange-100 text-orange-700 border-orange-200' :
                      'bg-black text-white border-black'}`}>
                    {order.status}
                </div>
            </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 mb-8 relative overflow-hidden hidden md:block">
            <div className="relative z-10 flex justify-between">
                {steps.map((step, idx) => {
                    const isCompleted = idx <= currentStepIndex;
                    const Icon = step.icon;
                    
                    // Dynamic Colors based on status type
                    let activeColor = 'bg-black text-white';
                    let activeText = 'text-black';
                    
                    if (isCancelled) {
                        activeColor = 'bg-red-600 text-white';
                        activeText = 'text-red-600';
                    } else if (isReturned) {
                        activeColor = 'bg-orange-600 text-white';
                        activeText = 'text-orange-600';
                    }

                    return (
                        <div key={step.id} className="flex flex-col items-center relative z-10 w-24">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors duration-500
                                ${isCompleted ? activeColor : 'bg-gray-100 text-gray-400'}`}>
                                <Icon size={18} />
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wide transition-colors duration-500
                                ${isCompleted ? activeText : 'text-gray-300'}`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
            
            {/* Connecting Line */}
            <div className="absolute top-12 left-0 w-full h-1 bg-gray-100 z-0 px-12 md:px-20">
                <div 
                    className={`h-full transition-all duration-1000 ease-out 
                        ${isCancelled ? 'bg-red-600' : isReturned ? 'bg-orange-600' : 'bg-black'}`}
                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }} 
                />
            </div>
        </div>

        {/* Mobile View for Cancelled/Returned Message */}
        {(isCancelled || isReturned) && (
             <div className={`md:hidden mb-8 p-4 rounded-xl flex items-center gap-4
                ${isCancelled ? 'bg-red-50 text-red-800' : 'bg-orange-50 text-orange-800'}`}>
                {isCancelled ? <XCircle size={24} /> : <ArrowLeft size={24} />}
                <div>
                    <p className="font-bold">{isCancelled ? 'Order Cancelled' : 'Order Returned'}</p>
                    <p className="text-xs opacity-80">
                        {isCancelled 
                            ? 'This order has been cancelled and will not be delivered.' 
                            : 'This order has been marked as returned.'}
                    </p>
                </div>
             </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left: Items */}
            <div className="md:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Package size={18} /> Items
                    </h3>
                    <div className="space-y-4">
                        {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-4 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                    <img src={item.image} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-900">{item.name}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Qty: {item.quantity} {item.size && `• Size: ${item.size}`}
                                    </p>
                                    <p className="text-sm font-bold mt-2">LKR {item.price.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: Summary */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <MapPin size={18} /> Delivery
                    </h3>
                    <div className="text-sm text-gray-600 leading-relaxed">
                        <p className="font-bold text-black mb-1">
                            {order.shippingAddress.firstname} {order.shippingAddress.lastname}
                        </p>
                        <p>{order.shippingAddress.addressLine}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                        <p className="mt-2 text-xs text-gray-400">
                            {order.shippingAddress.phoneNumber}
                        </p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-4">Payment</h3>
                    <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-gray-500">Method</span>
                        <span className="font-medium">Cash on Delivery</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <span className="font-bold text-lg">Total</span>
                        <span className="font-black text-xl">LKR {order.totalAmount.toLocaleString()}</span>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}