'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/app/utils/axiosInstance';
import { useParams } from 'next/navigation';
import { Minus, Plus, ShoppingBag, Heart, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/app/hooks/useCart';
import useUser from '@/app/hooks/useUser';

// --- Sub-Component: Image Gallery ---
const ProductGallery = ({ images, name }: { images: { url: string }[], name: string }) => {
  const [activeImage, setActiveImage] = useState(images[0]?.url || '');

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible">
        {images.map((img, idx) => (
          <button 
            key={idx} 
            onClick={() => setActiveImage(img.url)}
            className={`w-20 h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 ${activeImage === img.url ? 'border-black' : 'border-transparent'}`}
          >
            <img src={img.url} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
      <div className="flex-1 bg-gray-100 rounded-2xl overflow-hidden relative aspect-[3/4] md:aspect-auto md:h-[600px]">
        <img src={activeImage || images[0]?.url} alt={name} className="w-full h-full object-cover" />
      </div>
    </div>
  );
};

export default function ProductPage() {
  const { sku } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  // 👇 FIX 1: Tell useUser that login is NOT required for this page
  const { user } = useUser({ required: false }); 
  const { addItem, toggleCart } = useCart();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', sku],
    queryFn: async () => {
      // Ensure your backend allows public access to this route
      const res = await axiosInstance.get(`/api/products/${sku}`, { isPublic: true });
      return res.data;
    }
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  const originalPrice = product.price;
  let finalPrice = originalPrice;
  if (product.discountType === 'PERCENTAGE') {
    finalPrice = originalPrice - (originalPrice * (product.discountValue / 100));
  } else if (product.discountType === 'FIXED') {
    finalPrice = originalPrice - product.discountValue;
  }

  const handleAddToCart = async () => {
    if (!selectedSize && product.variants.length > 0) {
      alert('Please select a size');
      return;
    }

    const newItem = {
      sku: product.sku,
      productId: product.id,
      name: product.name,
      price: finalPrice,
      image: product.images[0]?.url || '',
      quantity: quantity,
      size: selectedSize,
      color: selectedColor
    };

    addItem(newItem);
    toggleCart();

    // Only sync if user exists (now safe because page loads for guests)
    if (user) {
      try {
        await axiosInstance.post('/api/cart', newItem);
      } catch (error) {
        console.error("Failed to sync item to server:", error);
      }
    }
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 py-4 text-sm text-gray-500">
        <Link href="/">Home</Link> <span className="mx-2">/</span>
        <Link href="/shop">Shop</Link> <span className="mx-2">/</span>
        <span className="text-black font-medium">{product.name}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 mt-4">
        <ProductGallery images={product.images} name={product.name} />

        <div className="space-y-8">
          <div className="space-y-2 border-b border-gray-100 pb-6">
            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wide">{product.brand}</h2>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900">{product.name}</h1>
            
            <div className="flex items-center gap-4 mt-4">
              <span className="text-2xl font-bold text-gray-900">LKR {finalPrice.toLocaleString()}</span>
              {product.discountType !== 'NONE' && (
                <>
                  <span className="text-lg text-gray-400 line-through">LKR {originalPrice.toLocaleString()}</span>
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                    {product.discountType === 'PERCENTAGE' ? `-${product.discountValue}%` : 'SALE'}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="text-gray-600 leading-relaxed text-sm">
            <p>{product.description}</p>
          </div>

          <div className="space-y-6">
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">Color</h3>
                <div className="flex gap-3">
                  {product.colors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${selectedColor === color ? 'border-black' : 'border-gray-200'}`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {product.variants && product.variants.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v: any) => (
                    <button
                      key={v.size}
                      disabled={v.stock === 0}
                      onClick={() => setSelectedSize(v.size)}
                      className={`min-w-[3rem] h-10 px-3 rounded-lg text-sm font-medium border transition-all
                        ${selectedSize === v.size ? 'bg-black text-white border-black' : 'bg-white text-gray-900 border-gray-200 hover:border-black'}
                        ${v.stock === 0 ? 'opacity-50 cursor-not-allowed bg-gray-50 text-gray-400 decoration-slice line-through' : ''}
                      `}
                    >
                      {v.size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
            <div className="flex items-center border border-gray-200 rounded-lg w-fit">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-gray-50">
                <Minus size={16} />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-gray-50">
                <Plus size={16} />
              </button>
            </div>

            <button 
              onClick={handleAddToCart}
              disabled={!product.availability}
              className="flex-1 bg-black text-white h-12 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {product.availability ? <><ShoppingBag size={18} /> Add to Cart</> : 'Out of Stock'}
            </button>

            <button className="h-12 w-12 border border-gray-200 rounded-lg flex items-center justify-center hover:border-black transition-colors text-gray-600">
              <Heart size={20} />
            </button>
          </div>

          <div className="pt-6 space-y-2 text-xs text-gray-500">
            <p>SKU: <span className="text-gray-900">{product.sku}</span></p>
            <p>Category: <span className="text-gray-900 capitalize">{product.category?.name}</span></p>
            {product.availability ? (
               <p className="text-green-600 flex items-center gap-1"><CheckIcon /> In Stock</p>
            ) : (
               <p className="text-red-500 flex items-center gap-1"><AlertCircle size={14} /> Out of Stock</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);