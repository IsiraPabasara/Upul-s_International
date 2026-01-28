'use client';

import Link from 'next/link';
import { ShoppingBag, Heart } from 'lucide-react';
import { useWishlist } from '@/app/hooks/useWishlist';
import axiosInstance from '@/app/utils/axiosInstance';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: {
    id: string; // Added ID for wishlist logic
    sku: string;
    name: string;
    price: number;
    brand: string;
    images: { url: string }[];
    discountType: 'NONE' | 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    availability: boolean;
    slug?: string; // Optional for compatibility
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toggleItem, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  // Calculate final price
  const originalPrice = product.price;
  let finalPrice = originalPrice;
  
  if (product.discountType === 'PERCENTAGE') {
    finalPrice = originalPrice - (originalPrice * (product.discountValue / 100));
  } else if (product.discountType === 'FIXED') {
    finalPrice = originalPrice - product.discountValue;
  }

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product page
    e.stopPropagation();

    const item = {
      productId: product.id,
      name: product.name,
      price: finalPrice,
      image: product.images[0]?.url || '',
      slug: product.slug || product.sku, // Fallback
      // Store extra data so the wishlist page can render this card nicely
      brand: product.brand,
      sku: product.sku,
      discountType: product.discountType,
      discountValue: product.discountValue,
      availability: product.availability
    };

    // 1. Optimistic UI Update
    toggleItem(item); // @ts-ignore (we are storing extra data in the store for the card)

    if (!isWishlisted) toast.success("Added to wishlist");
    else toast.success("Removed from wishlist");

    // 2. Try to sync with server - will silently fail if not logged in
    try {
       await axiosInstance.post('/api/wishlist/toggle', item, { isPublic: true });
    } catch (err) { 
       // Silently fail - user is likely not logged in, wishlist is saved locally
    }
  };

  return (
    <div className="group block relative">
      <Link href={`/product/${product.sku}`}>
        <div className="relative aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden mb-3">
          {/* Image */}
          {product.images[0] ? (
            <img 
              src={product.images[0].url} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">
              No Image
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.discountType !== 'NONE' && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">
                SALE
              </span>
            )}
            {!product.availability && (
              <span className="bg-black text-white text-[10px] font-bold px-2 py-1 rounded">
                SOLD OUT
              </span>
            )}
          </div>

          {/* --- ACTION BUTTONS --- */}
          <div className="absolute top-2 right-2 z-20">
             <button 
                onClick={handleWishlistToggle}
                className={`p-2 rounded-full shadow-sm transition-all duration-300 
                  ${isWishlisted ? 'bg-red-50 text-red-500' : 'bg-white/80 hover:bg-black hover:text-white text-gray-600'}`}
             >
                <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
             </button>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-1">
          <p className="text-xs text-gray-500 uppercase font-medium tracking-wide">{product.brand}</p>
          <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-black">LKR {finalPrice.toLocaleString()}</span>
            {product.discountType !== 'NONE' && (
              <span className="text-gray-400 line-through text-xs">
                LKR {originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}