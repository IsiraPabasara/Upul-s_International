'use client';
import { useCart } from '@/app/hooks/useCart';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// 👇 1. Add these imports
import useUser from '@/app/hooks/useUser';
import axiosInstance from '@/app/utils/axiosInstance';
import toast from 'react-hot-toast';

export default function CartSlider() {
  const { items, isOpen, toggleCart, updateQuantity, removeItem } = useCart();
  const [mounted, setMounted] = useState(false);
  
  // 👇 2. Get User Status
  const { user } = useUser();

  // Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // 👇 3. The New Delete Logic
  const handleRemoveItem = async (sku: string) => {
    // A. Optimistic Update (Remove from UI instantly)
    removeItem(sku);

    // B. If User is Logged In, Sync with Server
    if (user) {
      try {
        await axiosInstance.delete(`/api/cart/${sku}`);
      } catch (error) {
        console.error("Failed to delete item from server:", error);
        toast.error("Could not remove item from server");
        // Optional: You could reload the page or fetch cart again here to revert
      }
    }
  };

  // 👇 4. The New Quantity Logic (Sync Updates too!)
  const handleUpdateQuantity = async (sku: string, newQty: number) => {
     if (newQty < 1) return;
     
     // UI Update
     updateQuantity(sku, newQty);

     // Server Update
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
                <p>Your cart is empty</p>
                <button onClick={toggleCart} className="mt-4 text-black underline">Continue Shopping</button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.sku} className="flex gap-4">
                  <div className="w-20 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{item.name}</h3>
                      <p className="text-xs text-gray-500">{item.color} / {item.size}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border rounded">
                        <button 
                          // 👇 Use new handler
                          onClick={() => handleUpdateQuantity(item.sku, item.quantity - 1)}
                          className="px-2 py-1 hover:bg-gray-50"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-xs font-medium w-8 text-center">{item.quantity}</span>
                        <button 
                          // 👇 Use new handler
                          onClick={() => handleUpdateQuantity(item.sku, item.quantity + 1)}
                          className="px-2 py-1 hover:bg-gray-50"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="font-bold text-sm">LKR {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                  {/* 👇 Use new handler */}
                  <button onClick={() => handleRemoveItem(item.sku)} className="text-gray-400 hover:text-red-500 self-start">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
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