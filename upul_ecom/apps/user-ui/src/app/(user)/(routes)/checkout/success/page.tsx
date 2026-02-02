'use client';

import Link from 'next/link';
import { CheckCircle, Phone, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl p-8 text-center border border-gray-100">
        
        {/* Success Icon Animation */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-green-600 w-10 h-10" />
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-2">Order Placed!</h1>
        <p className="text-gray-500 mb-8">Thank you for shopping with us.</p>

        {/* Order Details Card */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Order Reference</p>
          <p className="text-4xl font-black text-black tracking-tight">#{orderNumber || '----'}</p>
        </div>

        {/* Next Steps / Instructions */}
        <div className="text-left space-y-4 mb-8">
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-1">
              <span className="font-bold text-sm">1</span>
            </div>
            <div>
              <p className="font-bold text-gray-900">Wait for Confirmation</p>
              <p className="text-sm text-gray-500">Our team will call you shortly to confirm your address and order details.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-1">
               <Phone size={16} />
            </div>
            <div>
              <p className="font-bold text-gray-900">Keep your phone nearby</p>
              <p className="text-sm text-gray-500">We cannot ship your order until we verify it over the phone.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link 
            href="/shop" 
            className="block w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition"
          >
            Continue Shopping
          </Link>
          
          <Link 
            href="/profile/orders" 
            className="flex items-center justify-center gap-2 w-full bg-white text-gray-600 py-4 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition"
          >
            View My Orders <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl p-8 text-center border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse"></div>
          <div className="h-8 bg-gray-100 rounded mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}