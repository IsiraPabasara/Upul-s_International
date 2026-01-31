"use client";

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/app/utils/axiosInstance';
import { useParams, useRouter } from 'next/navigation';
import { 
  Minus, Plus, ShoppingBag, CheckCircle, AlertCircle, Heart, Loader2, Zap, 
  Banknote, ChevronDown, ChevronUp, Truck, RotateCcw, FileText 
} from 'lucide-react';
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
  sizeType?: string; 
}

// --- Components ---

const ProductGallery = ({ images, name }: { images: { url: string }[], name: string }) => {
  const [activeImage, setActiveImage] = useState(images?.[0]?.url || '');
  
  useEffect(() => {
    if(images?.[0]?.url) setActiveImage(images[0].url);
  }, [images]);

  useEffect(() => {
    // Use 'instant' for an immediate jump to the top
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant', 
    });
  }, [])

  if (!images || images.length === 0) return <div className="bg-gray-100 h-96 rounded-xl flex items-center justify-center text-gray-400">No Image</div>;

  return (
    <div className="w-full">
      {/* === MOBILE: Swipeable Slider === */}
      <div className="md:hidden relative w-full aspect-[3/4] bg-gray-50 rounded-2xl overflow-hidden group">
        <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar w-full h-full">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img.url}
              alt={`${name} ${idx}`}
              className="w-full h-full object-cover flex-shrink-0 snap-center"
            />
          ))}
        </div>
        {/* Simple Indicator Pill */}
        <div className="absolute bottom-4 right-4 bg-black/60 text-white text-[10px] px-3 py-1 rounded-full backdrop-blur-sm pointer-events-none">
           {images.length} Photos
        </div>
      </div>

      {/* === DESKTOP: Vertical Thumbs + Main Image === */}
      <div className="hidden md:flex flex-row gap-4">
        <div className="flex flex-col gap-3 h-[600px] overflow-y-auto no-scrollbar py-1">
          {images.map((img, idx) => (
            <button 
              key={idx} 
              onMouseEnter={() => setActiveImage(img.url)}
              onClick={() => setActiveImage(img.url)}
              className={`w-20 h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all 
                ${activeImage === img.url ? 'border-black ring-1 ring-black' : 'border-transparent hover:border-gray-300'}`}
            >
              <img src={img.url} alt={`${name} ${idx}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
        <div className="flex-1 bg-gray-50 rounded-2xl overflow-hidden relative h-[600px]">
          <img src={activeImage || images[0]?.url} alt={name} className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
};

// Accordion Component
const AccordionItem = ({ title, icon: Icon, children, defaultOpen = false }: any) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex items-center justify-between text-left group"
      >
        <span className="font-bold text-gray-900 flex items-center gap-3 text-sm uppercase tracking-wide">
          {Icon && <Icon size={18} className="text-gray-400 group-hover:text-black transition-colors" />}
          {title}
        </span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
        <div className="text-sm text-gray-600 leading-relaxed px-1 pl-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function ProductPage() {
  const { sku } = useParams();
  const router = useRouter();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  // Note: ensure your addItem function accepts a second 'openCart' boolean argument
  const { items, addItem } = useCart(); 
  const { toggleItem, isInWishlist } = useWishlist();

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['product', sku],
    queryFn: async () => {
      const res = await axiosInstance.get(`/api/products/${sku}`);
      return res.data;
    }
  });

  const isWishlisted = product ? isInWishlist(product.id) : false;

  // --- Derived State ---
  const isOneSizeProduct = product?.sizeType === 'One Size';
  const hasVariants = !!product && !isOneSizeProduct && Array.isArray(product.variants) && product.variants.length > 0;

  // --- ⚡ AUTO SELECT SIZE ON LOAD ---
  useEffect(() => {
    if (product && hasVariants && !selectedSize) {
      const firstAvailable = product.variants.find(v => v.stock > 0);
      if (firstAvailable) {
        setSelectedSize(firstAvailable.size);
      } else if (product.variants.length > 0) {
        setSelectedSize(product.variants[0].size);
      }
    }
  }, [product, hasVariants, selectedSize]);

  // --- 🧠 STOCK LOGIC ---
  const remainingStock = useMemo(() => {
    if (!product) return 0;
    
    let totalStockForSelection = 0;
    
    if (hasVariants) {
      if (!selectedSize) return 0; 
      const variant = product.variants.find(v => v.size === selectedSize);
      totalStockForSelection = variant ? variant.stock : 0;
    } else {
      totalStockForSelection = product.stock || 0;
    }

    const cartItem = items.find(item => {
      if (item.productId !== product.id) return false;
      if (hasVariants) return item.size === selectedSize; 
      return true; 
    });

    const alreadyInCart = cartItem ? cartItem.quantity : 0;
    return Math.max(0, totalStockForSelection - alreadyInCart);

  }, [items, product, selectedSize, hasVariants]);

  useEffect(() => {
    setQuantity(1);
  }, [selectedSize]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  const originalPrice = product.price;
  let finalPrice = originalPrice;
  if (product.discountType === 'PERCENTAGE') {
    finalPrice = originalPrice - (originalPrice * (product.discountValue / 100));
  } else if (product.discountType === 'FIXED') {
    finalPrice = originalPrice - product.discountValue;
  }

  const canAddToCart = product.availability && remainingStock > 0 && (!hasVariants || (hasVariants && selectedSize));

  // --- HANDLERS ---
  const handleIncreaseQty = () => { if (quantity < remainingStock) setQuantity(prev => prev + 1); };
  const handleDecreaseQty = () => { if (quantity > 1) setQuantity(prev => prev - 1); };

  const createCartItem = () => {
    const cartSku = (hasVariants && selectedSize) ? `${product.sku}-${selectedSize}` : product.sku;
    const variantMaxStock = hasVariants 
        ? product.variants.find(v => v.size === selectedSize)?.stock || 0
        : product.stock || 0;

    return {
      sku: cartSku,
      productId: product.id,
      name: product.name,
      price: finalPrice,
      image: product.images?.[0]?.url || '',
      quantity: quantity,
      size: hasVariants ? selectedSize : undefined,
      maxStock: variantMaxStock
    };
  };

  const handleAddToCart = async () => {
    if (hasVariants && !selectedSize) { toast.error('Please select a size first'); return; }
    if (quantity > remainingStock) { toast.error(`Limit reached for this item.`); return; }

    const newItem = createCartItem();
    addItem(newItem); // Opens cart by default
    toast.success("Added to cart");

    try { await axiosInstance.post('/api/cart', newItem, { isPublic: true }); } catch (error) {}
  };

  const handleBuyNow = async () => {
    if (hasVariants && !selectedSize) { toast.error('Please select a size first'); return; }
    if (quantity > remainingStock) { toast.error(`Limit reached for this item.`); return; }

    setIsBuyingNow(true);
    const newItem = createCartItem();
    
    // 👇 UPDATE: Pass 'false' to suppress the cart slider/drawer opening
    addItem(newItem, false);

    try { await axiosInstance.post('/api/cart', newItem, { isPublic: true }); } catch (error) {}

    const verificationItems = [...items];
    const existingItemIndex = verificationItems.findIndex(i => i.sku === newItem.sku);
    if (existingItemIndex > -1) {
        verificationItems[existingItemIndex] = {
            ...verificationItems[existingItemIndex],
            quantity: verificationItems[existingItemIndex].quantity + newItem.quantity
        };
    } else {
        verificationItems.push(newItem);
    }

    try {
        const { data } = await axiosInstance.post('/api/cart/verify', { items: verificationItems });
        if (data.isValid) {
            router.push('/checkout');
        } else {
            toast.error('Stock issue detected. Please check your cart.');
            setIsBuyingNow(false);
        }
    } catch (error) {
        toast.error('Something went wrong. Try again.');
        setIsBuyingNow(false);
    }
  };

  const handleWishlistToggle = async () => {
      const item = {
        productId: product.id,
        name: product.name,
        price: finalPrice,
        image: product.images[0]?.url || '',
        slug: product.sku, 
        brand: product.brand,
        sku: product.sku,
        discountType: product.discountType,
        discountValue: product.discountValue,
        availability: product.availability
      };
      toggleItem(item); // @ts-ignore
      if (!isWishlisted) toast.success("Added to wishlist");
      else toast.success("Removed from wishlist");
      try { await axiosInstance.post('/api/wishlist/toggle', item, { isPublic: true }); } catch (err) {}
  };


  return (
    <div className="bg-white min-h-screen pb-20 mt-8 md:mt-2 md:pt-5">
      
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-1 md:pt-0 md:pb-0 md:py-4 text-xs md:text-sm text-gray-500">
        <Link href="/">Home</Link> <span className="mx-2">/</span>
        <Link href="/shop">Shop</Link> <span className="mx-2">/</span>
        <span className="text-black font-medium">{product.name}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 mt-4">
        
        {/* Left: Gallery (Mobile Slide / Desktop Grid) */}
        <ProductGallery images={product.images} name={product.name} />

        {/* Right: Details */}
        <div className="space-y-8 font-outfit">
          <div className="space-y-2 border-b border-gray-100 pb-6">
            <div className="flex justify-between items-start">
               <h1 className="text-3xl md:text-4xl font-outfit font-bold text-gray-900 leading-tight">{product.name}</h1>
               <button onClick={handleWishlistToggle} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                  <Heart size={28} fill={isWishlisted ? "currentColor" : "none"} />
               </button>
            </div>
            
            <div className="flex items-center gap-4 mt-2">
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

            {/* COD Tag */}
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 mt-4 bg-gray-50 w-fit px-3 py-1.5 rounded-full border border-gray-100">
               <Banknote size={14} className="text-green-600" />
               Cash on Delivery Available
            </div>

            {/* Stock Status */}
            <div className="pt-6 space-y-2 text-xs text-gray-500">
                <p>Brand: <span className="text-gray-900 font-medium">{product.brand}</span></p>
                <p>SKU: <span className="text-gray-900 font-medium">{product.sku}</span></p>
                
                {(hasVariants && !selectedSize) ? (
                    <p className="text-blue-600 flex items-center gap-1 font-medium mt-2"><AlertCircle size={14} /> Select a size to see stock</p>
                ) : remainingStock > 0 ? (
                   <p className="text-green-600 flex items-center gap-1 font-medium mt-2">
                     <CheckCircle size={14} /> In Stock 
                     {remainingStock < 5 && <span className="text-red-500 ml-1">(Only {remainingStock} left!)</span>}
                   </p>
                ) : (
                   <p className="text-red-500 flex items-center gap-1 font-medium mt-2"><AlertCircle size={14} /> Out of Stock</p>
                )}
            </div>
          </div>

          {/* Size Selector */}
          <div className="space-y-6">
            {hasVariants && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Select Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants
                    .filter(v => v.size) // Filter empty sizes
                    .map((v: ProductVariant) => (
                    <button
                      key={v.size}
                      disabled={v.stock === 0}
                      onClick={() => setSelectedSize(v.size)}
                      className={`min-w-[3.5rem] h-12 px-4 rounded border transition-all text-sm font-bold
                        ${selectedSize === v.size 
                            ? 'bg-black text-white border-black shadow-md' 
                            : 'bg-white text-gray-900 border-gray-200 hover:border-black'}
                        ${v.stock === 0 
                            ? 'opacity-40 cursor-not-allowed bg-gray-50 text-gray-400 decoration-slice line-through border-gray-100 hover:border-gray-100' 
                            : ''}
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
          <div className="flex flex-col gap-4 pt-4">
            
            {/* Quantity Row */}
            <div className="flex items-center gap-4">
                <span className="text-sm font-bold uppercase tracking-wide text-gray-900">Quantity</span>
                <div className={`flex items-center border border-gray-200 rounded-lg w-fit ${(remainingStock === 0 && (!hasVariants || selectedSize)) ? 'opacity-50 pointer-events-none' : ''}`}>
                    <button onClick={handleDecreaseQty} disabled={quantity <= 1} className="p-3 hover:bg-gray-50 disabled:opacity-30">
                        <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-medium text-sm">{quantity}</span>
                    <button onClick={handleIncreaseQty} disabled={quantity >= remainingStock} className="p-3 hover:bg-gray-50 disabled:opacity-30">
                        <Plus size={16} />
                    </button>
                </div>
            </div>

            {/* Buttons Row */}
            <div className="flex gap-3 h-14 mt-2">
                <button 
                    onClick={handleAddToCart}
                    disabled={!canAddToCart || isBuyingNow}
                    className="flex-1 border-2 border-black text-black bg-white rounded-lg font-bold uppercase tracking-widest text-xs md:text-sm flex items-center justify-center gap-2 hover:bg-gray-50 disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
                >
                    <ShoppingBag size={18} /> Add to Cart
                </button>

                <button 
                    onClick={handleBuyNow}
                    disabled={!canAddToCart || isBuyingNow}
                    className="flex-1 bg-black text-white rounded-lg font-bold uppercase tracking-widest text-xs md:text-sm flex items-center justify-center gap-2 hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-xl shadow-gray-200"
                >
                    {isBuyingNow ? (
                        <><Loader2 size={18} className="animate-spin" /> Processing...</>
                    ) : (
                        <><Zap size={18} fill="currentColor" /> Buy Now</>
                    )}
                </button>
            </div>
          </div>

          {/* Details Accordion */}
          <div className="pt-8">
             <AccordionItem title="Description" icon={FileText} defaultOpen={true}>
                <p className="whitespace-pre-line leading-relaxed">{product.description || "No description available."}</p>
             </AccordionItem>
             
             <AccordionItem title="Shipping & Delivery" icon={Truck}>
                <p className="mb-2">We offer island-wide delivery across Sri Lanka.</p>
                <ul className="list-disc pl-5 space-y-1 text-gray-500">
                    <li>Colombo & Suburbs: <span className="text-gray-900 font-medium">1-2 Working Days</span></li>
                    <li>Outstation: <span className="text-gray-900 font-medium">3-5 Working Days</span></li>
                    <li>Standard Delivery Charge: <span className="text-gray-900 font-medium">LKR 450</span></li>
                </ul>
             </AccordionItem>

             <AccordionItem title="Returns & Exchanges" icon={RotateCcw}>
                <p>We want you to be completely satisfied with your purchase.</p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-500">
                    <li>Exchanges within <b>7 days</b> of delivery.</li>
                    <li>Items must be unworn with tags attached.</li>
                    <li>Clearance/Sale items are non-refundable.</li>
                </ul>
             </AccordionItem>
          </div>

        </div>
      </div>

      {/* Utility Styles for Scrollbar Hiding */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}