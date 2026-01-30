'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/app/utils/axiosInstance';
import { Loader2, Package, CheckCircle, Truck, Clock, MapPin, ChevronLeft, XCircle, ArrowLeft, CreditCard, Banknote } from 'lucide-react';
import Link from 'next/link';

export default function UserOrderDetailsPage() {
  const { id } = useParams();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['my-order', id],
    queryFn: async () => (await axiosInstance.get(`/api/orders/my-orders/${id}`)).data
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-xs uppercase tracking-[0.3em] font-bold">Loading Details...</div>;
  
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4 uppercase tracking-widest font-bold">Order not found</p>
        <Link href="/profile/orders" className="underline text-xs font-bold uppercase tracking-widest">Back to History</Link>
    </div>
  );

  const isCancelled = order.status === 'CANCELLED';
  const isReturned = order.status === 'RETURNED';
  const isPayHere = order.paymentMethod === 'PAYHERE';

  // --- Style Helper (Consistent with List Page) ---
  const getStatusStyle = (status: string) => {
    switch(status) {
        case 'DELIVERED': return 'bg-green-50 text-green-700 border-green-200';
        case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-200';
        case 'SHIPPED': return 'bg-blue-50 text-blue-700 border-blue-200';
        default: return 'bg-black text-white border-black';
    }
  };

  // --- Timeline Logic ---
  let steps = [
      { id: 'PENDING', label: 'Placed', icon: Clock },
      { id: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle },
      { id: 'PROCESSING', label: 'Processing', icon: Package },
      { id: 'SHIPPED', label: 'Shipped', icon: Truck },
      { id: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
  ];

  if (isCancelled) steps = [{ id: 'PENDING', label: 'Placed', icon: Clock }, { id: 'CANCELLED', label: 'Cancelled', icon: XCircle }];
  if (isReturned) steps = [...steps.slice(0, 4), { id: 'RETURNED', label: 'Returned', icon: ArrowLeft }];

  let currentStepIndex = steps.findIndex(s => s.id === order.status);
  if (currentStepIndex === -1 && order.status === 'DELIVERED') currentStepIndex = steps.findIndex(s => s.id === 'DELIVERED');

  return (
    <div className="w-full min-h-screen bg-white font-outfit pb-32">
      <div className="max-w-5xl mx-auto px-6 pt-20">
        
        {/* Nav - Consistent with List Page */}
        <Link href="/profile/orders" className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-gray-500 hover:text-black transition-colors mb-12">
           <ChevronLeft size={16} /> Back to Order History
        </Link>

        {/* Header - Consistent Margins & Border */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-black pb-8 gap-6">
            <div>
                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Order #{order.orderNumber}</h1>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wide mt-2">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
            </div>
            
            <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
                {order.trackingNumber && (
                    <div className="text-left md:text-right w-full md:w-auto bg-gray-50 p-3 md:p-0 md:bg-transparent rounded md:rounded-none border md:border-0 border-gray-100 mb-2 md:mb-0">
                        <p className="text-[10px] uppercase text-gray-400 font-bold tracking-[0.1em] mb-1">Domex Tracking</p>
                        <p className="font-mono font-bold text-lg md:border-b border-gray-100 pb-1">{order.trackingNumber}</p>
                    </div>
                )}
                <span className={`text-[10px] font-bold uppercase tracking-[0.1em] px-4 py-1.5 border rounded-sm ${getStatusStyle(order.status)}`}>
                    {order.status}
                </span>
            </div>
        </div>

        {/* Progress Bar (Hidden on mobile) */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 mb-8 relative overflow-hidden hidden md:block">
            <div className="relative z-10 flex justify-between">
                {steps.map((step, idx) => {
                    const isCompleted = idx <= currentStepIndex;
                    const Icon = step.icon;
                    
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            {/* Left: Items */}
            <div className="md:col-span-2 space-y-8">
                <div className="border border-gray-200 p-8 rounded-sm">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-900 mb-8 flex items-center gap-3">
                        <Package size={16} /> Order Items
                    </h3>
                    <div className="space-y-6">
                        {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-6 border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                                <div className="w-20 h-24 bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                                    <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="font-bold text-sm uppercase tracking-tight text-gray-900">{item.name}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">
                                        Qty: {item.quantity} {item.size && `| Size: ${item.size}`}
                                    </p>
                                    <p className="text-sm font-black mt-3">LKR {item.price.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: Summary */}
            <div className="space-y-8">
                {/* Delivery Box - Fixed Overflow */}
                <div className="border border-gray-200 p-8 bg-gray-50/30 rounded-sm">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-900 mb-6 flex items-center gap-3">
                        <MapPin size={16} /> Delivery
                    </h3>
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-600 leading-relaxed overflow-hidden">
                        <p className="text-black mb-2 text-sm break-words">
                            {order.shippingAddress.firstname} {order.shippingAddress.lastname}
                        </p>
                        <p className="break-words">{order.shippingAddress.addressLine}</p>
                        <p className="break-words">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                        <p className="mt-4 text-[10px] text-gray-400 break-all">
                            {order.shippingAddress.phoneNumber}
                        </p>
                    </div>
                </div>

                <div className="border border-gray-200 p-8 rounded-sm">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-900 mb-6 flex items-center gap-3">
                        {isPayHere ? <CreditCard size={16} /> : <Banknote size={16} />}
                        Payment
                    </h3>
                    <div className="flex justify-between items-center text-xs uppercase tracking-wider mb-4">
                        <span className="text-gray-400">Method</span>
                        {isPayHere ? (
                            <span className="font-bold text-blue-600">Online (Paid)</span>
                        ) : (
                            <span className="font-bold text-gray-900">Cash on Delivery</span>
                        )}
                    </div>
                    
                    {!isPayHere && (
                        <div className="bg-yellow-50 text-yellow-800 text-[10px] font-bold uppercase tracking-wide p-3 rounded mb-6 border border-yellow-100">
                            Please have the exact amount ready.
                        </div>
                    )}

                    <div className="flex justify-between items-end pt-6 border-t border-dashed border-gray-200">
                        <span className="font-bold text-sm uppercase tracking-widest">Total</span>
                        <span className="font-black text-xl tracking-tight">LKR {order.totalAmount.toLocaleString()}</span>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}