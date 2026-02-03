'use client';

import { useCart } from '@/app/hooks/useCart';
import {
  X,
  Minus,
  Plus,
  Trash2,
  AlertCircle,
  ShoppingBag,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import useUser from '@/app/hooks/useUser';
import axiosInstance from '@/app/utils/axiosInstance';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function CartSlider() {
  const {
    items,
    isOpen,
    toggleCart,
    updateQuantity,
    removeItem,
    validationErrors,
    setValidationErrors,
    updatePrices,
  } = useCart();

  const [mounted, setMounted] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  // 1. Initial Mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ 2. ADDED SCROLL LOCK LOGIC
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted) return null;

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // --- Handlers ---
  const handleRemoveItem = async (sku: string) => {
    removeItem(sku);
    setValidationErrors({});
    if (user) {
      try {
        await axiosInstance.delete(`/api/cart/${sku}`);
      } catch (error) {
        console.error('Failed to delete item:', error);
        toast.error('Could not remove item from server');
      }
    }
  };

  const handleUpdateQuantity = async (sku: string, newQty: number, maxStock: number) => {
    if (newQty < 1) return;
    const limit = maxStock || 99;
    if (newQty > limit) {
      toast.error(`Sorry, only ${limit} available.`);
      return;
    }

    updateQuantity(sku, newQty);
    setValidationErrors({});

    if (user) {
      try {
        await axiosInstance.put('/api/cart', { sku, quantity: newQty });
      } catch (error) {
        console.error('Failed to update quantity', error);
      }
    }
  };

  const handleCheckoutClick = async (e: React.MouseEvent) => {
  e.preventDefault();
  if (items.length === 0) return;

  setIsVerifying(true);
  setValidationErrors({});

  try {
    const { data } = await axiosInstance.post('/api/cart/verify', { items });

    if (data.isValid) {
      toggleCart();
      router.push('/checkout');
    } else {
      // 1. If the backend sent updated prices, update our store immediately
      if (data.updatedPrices && Object.keys(data.updatedPrices).length > 0) {
        updatePrices(data.updatedPrices);
        toast.error('Prices have changed. We have updated your cart.');
      }

      // 2. Set the errors so the UI shows the red messages
      setValidationErrors(data.errors || {});
      
      if (!data.updatedPrices || Object.keys(data.updatedPrices).length === 0) {
          toast.error('Some items are unavailable. Please review your cart.');
      }
    }
  } catch (error) {
    console.error('Verification failed', error);
    toast.error('Could not verify cart. Try again.');
  } finally {
    setIsVerifying(false);
  }
};
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={toggleCart}
          className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Slider Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full font-outfit">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-bold">Shopping Cart ({items.length})</h2>
            <button onClick={toggleCart} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={20} />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <ShoppingBag size={48} className="mb-4 text-gray-300" />
                <p>Your cart is empty</p>
                <button
                  onClick={toggleCart}
                  className="mt-4 text-black underline hover:text-gray-600"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              items.map((item) => {
                const stockLimit = item.maxStock ?? 99;
                const isMaxReached = item.quantity >= stockLimit;
                const errorMsg = validationErrors?.[item.sku];

                return (
                  <div
                    key={item.sku}
                    className={`flex gap-4 border-b border-gray-100 pb-6 last:border-0 ${
                      errorMsg ? 'bg-red-50/50 -m-2 p-2 rounded-lg' : ''
                    }`}
                  >
                    <div className="w-20 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-sm line-clamp-2">{item.name}</h3>
                          <button
                            onClick={() => handleRemoveItem(item.sku)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} className='ml-1'/>
                          </button>
                        </div>

                        <div className="flex gap-2 text-xs text-gray-500 mt-1">
                          {item.size && <span>Size: {item.size}</span>}
                          {item.color && (
                            <span className="flex items-center gap-1">
                              Color:{' '}
                              <span
                                className="w-2 h-2 rounded-full border"
                                style={{ backgroundColor: item.color }}
                              />
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-end justify-between mt-2">
                        <div className="flex flex-col items-start gap-1">
                          <div className="flex items-center border border-gray-200 rounded-md h-8">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.sku, item.quantity - 1, stockLimit)
                              }
                              disabled={item.quantity <= 1}
                              className="px-2 h-full hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Minus size={14} />
                            </button>

                            <span className="text-xs font-medium w-8 text-center">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.sku, item.quantity + 1, stockLimit)
                              }
                              disabled={isMaxReached}
                              className={`px-2 h-full flex items-center justify-center transition-colors 
                                ${
                                  isMaxReached
                                    ? 'bg-gray-100 opacity-50 cursor-not-allowed'
                                    : 'hover:bg-gray-50'
                                }`}
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          {isMaxReached && (
                            <span className="text-[10px] text-red-500 flex items-center gap-1">
                              <AlertCircle size={10} /> Max limit
                            </span>
                          )}

                          {errorMsg && (
                            <p className="text-[11px] text-red-600 font-bold mt-2 flex items-center gap-1">
                              <AlertCircle size={12} /> {errorMsg}
                            </p>
                          )}
                        </div>

                        <span className="font-bold text-sm">
                          LKR {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t p-6 bg-gray-50">
              <div className="flex justify-between items-center mb-4 text-lg font-bold">
                <span>Subtotal</span>
                <span>LKR {subtotal.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-500 mb-4">Taxes and shipping calculated at checkout.</p>

              <Link
                href="/checkout"
                onClick={handleCheckoutClick}
                className="flex items-center justify-center w-full bg-black text-white text-center py-4 rounded-lg font-bold hover:bg-gray-800 transition disabled:opacity-70 disabled:cursor-wait"
                aria-disabled={isVerifying}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} /> VERIFYING...
                  </>
                ) : (
                  'CHECKOUT'
                )}
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}