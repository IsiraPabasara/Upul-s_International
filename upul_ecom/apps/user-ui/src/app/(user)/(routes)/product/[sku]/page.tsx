"use client";

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/app/utils/axiosInstance';
import { useParams } from 'next/navigation';
import { Minus, Plus, ShoppingBag, CheckCircle, AlertCircle, Heart } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/app/hooks/useCart';
import { useWishlist } from '@/app/hooks/useWishlist';
import toast from 'react-hot-toast';

// --- Types ---
interface ProductVariant {
  size: string;
  stock: number;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  description: string;
  images: { url: string }[];
  brand: string;
  discountType: 'PERCENTAGE' | 'FIXED' | 'NONE';
  discountValue: number;
  colors: string[];
  variants: ProductVariant[];
  stock: number;
  availability: boolean;
  category?: { name: string };
  sizeType?: string; // e.g., "One Size", "Multiple Sizes"
}

// --- Gallery (Unchanged) ---
const ProductGallery = ({ images, name }: { images: { url: string }[], name: string }) => {
  const [activeImage, setActiveImage] = useState(images?.[0]?.url || '');
  if (!images || images.length === 0) return <div className="bg-gray-100 h-96 rounded-xl flex items-center justify-center text-gray-400">No Image</div>;

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible no-scrollbar p-1">
        {images.map((img, idx) => (
          <button 
            key={idx} 
            onClick={() => setActiveImage(img.url)}
            className={`w-20 h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all 
              ${activeImage === img.url ? 'border-black ring-1 ring-black' : 'border-transparent hover:border-gray-300'}`}
          >
            <img src={img.url} alt={`${name} ${idx}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
      <div className="flex-1 bg-gray-50 rounded-2xl overflow-hidden relative aspect-[3/4] md:aspect-auto md:h-[600px]">
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

  const { items, addItem, toggleCart } = useCart(); 
  const { toggleItem, isInWishlist } = useWishlist();

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['product', sku],
    queryFn: async () => {
      const res = await axiosInstance.get(`/api/products/${sku}`);
      return res.data;
    }
  });

  const isWishlisted = product ? isInWishlist(product.id) : false;

  // --- 🧠 CORE LOGIC: Calculate Remaining Stock for SPECIFIC VARIANT ---
  const remainingStock = useMemo(() => {
    if (!product) return 0;

    // If sizeType is "One Size", treat as simple product (use global stock)
    const isOneSizeProduct = product.sizeType === 'One Size';
    
    // Check if product has real variants (not "One Size")
    const hasVariants = !isOneSizeProduct && 
                       product.variants && 
                       Array.isArray(product.variants) && 
                       product.variants.length > 0;
    
    // 1. Get Total Stock for CURRENT Selection
    let totalStockForSelection = 0;
    
    if (hasVariants) {
      if (!selectedSize) return 0; 
      const variant = product.variants.find(v => v.size === selectedSize);
      totalStockForSelection = variant ? variant.stock : 0;
    } else {
      // No variants or "One Size" - use total product stock
      totalStockForSelection = product.stock || 0;
    }

    // 2. Count ONLY matching items in cart
    const cartItem = items.find(item => {
      // Must match Product ID
      if (item.productId !== product.id) return false;

      // If product has variants, MUST match size strictly
      if (hasVariants) {
        return item.size === selectedSize; 
      }
      
      // If simple product (no variants or "One Size"), we already matched ID, so true
      return true; 
    });

    const alreadyInCart = cartItem ? cartItem.quantity : 0;
    return Math.max(0, totalStockForSelection - alreadyInCart);

  }, [items, product, selectedSize]);

  // Reset quantity when size changes (so you don't carry over high qty to low stock variant)
  useEffect(() => {
    setQuantity(1);
  }, [selectedSize]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  const originalPrice = product.price;
  let finalPrice = originalPrice;
  if (product.discountType === 'PERCENTAGE') {
    finalPrice = originalPrice - (originalPrice * (product.discountValue / 100));
  } else if (product.discountType === 'FIXED') {
    finalPrice = originalPrice - product.discountValue;
  }

  const isOneSizeProduct = product.sizeType === 'One Size';
  const hasVariants = !isOneSizeProduct && 
                     product.variants && 
                     Array.isArray(product.variants) && 
                     product.variants.length > 0;

  // --- Check if add to cart is allowed ---
  const canAddToCart = product.availability && 
    remainingStock > 0 && 
    (!hasVariants || (hasVariants && selectedSize));

  // --- HANDLERS ---
  const handleIncreaseQty = () => {
    if (quantity < remainingStock) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecreaseQty = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    // 1. Validation
    if (hasVariants && !selectedSize) {
      alert('Please select a size first');
      return;
    }

    if (quantity > remainingStock) {
        alert(`Sorry, you hit the limit for this size.`);
        return;
    }

    // 2. Generate Unique SKU for Cart
    // If it has a size, append it (e.g., "SKU123-M"). If not, use original ("SKU123")
    const cartSku = (hasVariants && selectedSize) 
      ? `${product.sku}-${selectedSize}` 
      : product.sku;

    // 3. Find Max Stock for THIS specific variant
    let variantMaxStock = 0;
    if (hasVariants) {
       variantMaxStock = product.variants.find(v => v.size === selectedSize)?.stock || 0;
    } else {
       variantMaxStock = product.stock || 0;
    }

    const newItem = {
      sku: cartSku, // 👈 KEY FIX: Use the unique variant SKU
      productId: product.id,
      name: product.name,
      price: finalPrice,
      image: product.images?.[0]?.url || '',
      quantity: quantity,
      size: hasVariants ? selectedSize : undefined,
      color: selectedColor,
      maxStock: variantMaxStock
    };

    // 4. Add & Sync
    addItem(newItem);

    // Try to sync with server - will silently fail if not logged in
    try {
      await axiosInstance.post('/api/cart', newItem, { isPublic: true });
    } catch (error) {
      // Silently fail - user is likely not logged in, cart is saved locally
    }
  };

  const handleWishlistToggle = async () => {
      const item = {
        productId: product.id,
        name: product.name,
        price: finalPrice,
        image: product.images[0]?.url || '',
        slug: product.sku, // fallback
        // Add extra data so the wishlist page works without refetching
        brand: product.brand,
        sku: product.sku,
        discountType: product.discountType,
        discountValue: product.discountValue,
        availability: product.availability
      };

      toggleItem(item); // @ts-ignore
      if (!isWishlisted) toast.success("Added to wishlist");
      else toast.success("Removed from wishlist");

      // Try to sync with server - will silently fail if not logged in
      try { 
        await axiosInstance.post('/api/wishlist/toggle', item, { isPublic: true }); 
      } catch (err) { 
        // Silently fail - user is likely not logged in, wishlist is saved locally
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
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all
                        ${selectedColor === color ? 'border-black ring-2 ring-gray-100' : 'border-gray-200'}`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {hasVariants && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v: ProductVariant) => (
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

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
            <div className={`flex items-center border border-gray-200 rounded-lg w-fit ${(remainingStock === 0 && (!hasVariants || selectedSize)) ? 'opacity-50 pointer-events-none' : ''}`}>
              <button onClick={handleDecreaseQty} disabled={quantity <= 1} className="p-3 hover:bg-gray-50 disabled:opacity-30">
                <Minus size={16} />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button onClick={handleIncreaseQty} disabled={quantity >= remainingStock} className="p-3 hover:bg-gray-50 disabled:opacity-30">
                <Plus size={16} />
              </button>
            </div>

            <button 
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              className="flex-1 bg-black text-white h-12 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {(hasVariants && !selectedSize) ? 'Select a Size' : 
               remainingStock === 0 ? 'Out of Stock' : 
               !product.availability ? 'Out of Stock' : 
               <><ShoppingBag size={18} /> Add to Cart</>}
            </button>

            <button 
              onClick={handleWishlistToggle}
              className={`h-12 w-12 flex items-center justify-center border rounded-lg transition-colors
                 ${isWishlisted ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 hover:border-black'}`}
            >
                <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} /> 
            </button>
          </div>

          <div className="pt-6 space-y-2 text-xs text-gray-500">
            <p>SKU: <span className="text-gray-900">{product.sku}</span></p>
            <p>Category: <span className="text-gray-900 capitalize">{product.category?.name || 'General'}</span></p>
            
            {(hasVariants && !selectedSize) ? (
                <p className="text-blue-600 flex items-center gap-1 font-medium"><AlertCircle size={14} /> Select a size to see stock</p>
            ) : remainingStock > 0 ? (
               <p className="text-green-600 flex items-center gap-1 font-medium">
                 <CheckCircle size={14} /> In Stock 
                 <span className="text-gray-400 ml-1">({remainingStock} more available)</span>
               </p>
            ) : (
               <p className="text-red-500 flex items-center gap-1 font-medium"><AlertCircle size={14} /> Limit Reached</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}