'use client';
import { useCart } from '@/app/hooks/useCart';
import { X, Minus, Plus, Trash2, AlertCircle, ShoppingBag } from 'lucide-react'; // 👈 Added AlertCircle
import Link from 'next/link';
import { useEffect, useState } from 'react';
import useUser from '@/app/hooks/useUser';
import axiosInstance from '@/app/utils/axiosInstance';
import toast from 'react-hot-toast';

export default function CartSlider() {
  const { items, isOpen, toggleCart, updateQuantity, removeItem } = useCart();
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // --- Logic to Remove Item ---
  const handleRemoveItem = async (sku: string) => {
    removeItem(sku);
    if (user) {
      try {
        await axiosInstance.delete(`/api/cart/${sku}`);
      } catch (error) {
        console.error("Failed to delete item:", error);
        toast.error("Could not remove item from server");
      }
    }
  };

  // --- Logic to Update Quantity ---
  const handleUpdateQuantity = async (sku: string, newQty: number, maxStock: number) => {
      // 1. Prevent going below 1
      if (newQty < 1) return;

      // 2. Prevent going above Stock Limit
      // We use '99' as fallback if maxStock is missing, but it should be there.
      const limit = maxStock || 99; 
      if (newQty > limit) {
        toast.error(`Sorry, only ${limit} available.`);
        return;
      }
      
      updateQuantity(sku, newQty);

      if (user) {
        try {
           await axiosInstance.put('/api/cart', { sku, quantity: newQty });
        } catch (error) {
           console.error("Failed to update quantity");
        }
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
      <div className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="flex flex-col h-full">
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
                <button onClick={toggleCart} className="mt-4 text-black underline hover:text-gray-600">Continue Shopping</button>
              </div>
            ) : (
              items.map((item) => {
                // 👇 Calculate Limit State for THIS item
                // Use a default large number if maxStock is somehow missing/0 to prevent locking users out erroneously
                const stockLimit = item.maxStock ?? 99; 
                const isMaxReached = item.quantity >= stockLimit;

                return (
                  <div key={item.sku} className="flex gap-4 border-b border-gray-100 pb-6 last:border-0">
                    <div className="w-20 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-sm line-clamp-2">{item.name}</h3>
                          <button onClick={() => handleRemoveItem(item.sku)} className="text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        {/* Variant Info */}
                        <div className="flex gap-2 text-xs text-gray-500 mt-1">
                           {item.size && <span>Size: {item.size}</span>}
                           {item.color && (
                             <span className="flex items-center gap-1">
                               Color: <span className="w-2 h-2 rounded-full border" style={{backgroundColor: item.color}} />
                             </span>
                           )}
                        </div>
                      </div>

                      <div className="flex items-end justify-between mt-2">
                        {/* Quantity Controls */}
                        <div className="flex flex-col items-start gap-1">
                          <div className="flex items-center border border-gray-200 rounded-md h-8">
                            <button 
                              onClick={() => handleUpdateQuantity(item.sku, item.quantity - 1, stockLimit)}
                              disabled={item.quantity <= 1}
                              className="px-2 h-full hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Minus size={14} />
                            </button>
                            
                            <span className="text-xs font-medium w-8 text-center">{item.quantity}</span>
                            
                            <button 
                              onClick={() => handleUpdateQuantity(item.sku, item.quantity + 1, stockLimit)}
                              disabled={isMaxReached} // 👈 DISABLES BUTTON
                              className={`px-2 h-full flex items-center justify-center transition-colors 
                                ${isMaxReached ? 'bg-gray-100 opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          {/* Warning Message */}
                          {isMaxReached && (
                            <span className="text-[10px] text-red-500 flex items-center gap-1">
                              <AlertCircle size={10} /> Max limit
                            </span>
                          )}
                        </div>

                        <span className="font-bold text-sm">LKR {(item.price * item.quantity).toLocaleString()}</span>
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
                onClick={toggleCart}
                className="block w-full bg-black text-white text-center py-4 rounded-lg font-bold hover:bg-gray-800 transition"
              >
                CHECKOUT
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}