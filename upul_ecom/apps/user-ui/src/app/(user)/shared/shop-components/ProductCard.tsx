'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: {
    sku: string;
    name: string;
    price: number;
    brand: string;
    images: { url: string }[];
    discountType: 'NONE' | 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    availability: boolean;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  // Calculate final price for display
  const originalPrice = product.price;
  let finalPrice = originalPrice;
  
  if (product.discountType === 'PERCENTAGE') {
    finalPrice = originalPrice - (originalPrice * (product.discountValue / 100));
  } else if (product.discountType === 'FIXED') {
    finalPrice = originalPrice - product.discountValue;
  }

  return (
    <Link href={`/product/${product.sku}`} className="group block">
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

        {/* Quick Add Overlay (Optional polish) */}
        <div className="absolute bottom-4 right-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button className="bg-white p-2 rounded-full shadow-lg hover:bg-black hover:text-white transition-colors">
            <ShoppingBag size={18} />
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
  );
}