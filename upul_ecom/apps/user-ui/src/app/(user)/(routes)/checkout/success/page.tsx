'use client';

import Link from 'next/link';
import { CheckCircle, Phone, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useCart } from '@/app/hooks/useCart';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center px-3 py-6 sm:px-6 sm:py-10">
      <div className="bg-white w-full max-w-md sm:max-w-lg rounded-2xl shadow-lg border border-gray-100 text-center p-5 sm:p-8">
        {/* Icon */}
        <div className="w-14 h-14 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <CheckCircle className="text-green-600 w-7 h-7 sm:w-10 sm:h-10" />
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-1 sm:mb-2">
          Order Placed!
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mb-5 sm:mb-8">
          Thank you for shopping with us.
        </p>

        {/* Order ref */}
        <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-5 sm:mb-8 border border-gray-200">
          <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            Order Reference
          </p>
          <p className="text-3xl sm:text-4xl font-black text-black tracking-tight">
            #{orderNumber || '----'}
          </p>
        </div>

        {/* Steps */}
        <div className="text-left space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          <div className="flex gap-3 sm:gap-4 items-start">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-1">
              <span className="font-bold text-xs sm:text-sm">1</span>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm sm:text-base">
                Wait for Confirmation
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                Our team will call you shortly to confirm your address and order details.
              </p>
            </div>
          </div>

          <div className="flex gap-3 sm:gap-4 items-start">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-1">
              <Phone className="w-4 h-4 sm:w-4 sm:h-4" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm sm:text-base">
                Keep your phone nearby
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                We cannot ship your order until we verify it over the phone.
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2 sm:space-y-3">
          <Link
            href="/shop"
            className="block w-full bg-black text-white py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base hover:bg-gray-800 transition"
          >
            Continue Shopping
          </Link>

          <Link
            href="/profile/orders"
            className="flex items-center justify-center gap-2 w-full bg-white text-gray-600 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base border border-gray-200 hover:bg-gray-50 transition"
          >
            View My Orders <ArrowRight size={16} className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
