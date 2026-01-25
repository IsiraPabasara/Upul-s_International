'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/app/utils/axiosInstance';
import { ChevronDown, ChevronRight, Minus, Check, Layers } from 'lucide-react';

// --- Helper: Build Tree ---
const buildCategoryTree = (categories: any[]) => {
  const map: any = {};
  const roots: any[] = [];
  categories.forEach(cat => {
    map[cat.id] = { ...cat, children: [] };
  });
  categories.forEach(cat => {
    if (cat.parentId && map[cat.parentId]) {
      map[cat.parentId].children.push(map[cat.id]);
    } else {
      roots.push(map[cat.id]);
    }
  });
  return roots;
};

// --- Helper: Check Descendants ---
const isDescendantActive = (category: any, currentSlug: string | null): boolean => {
  if (!currentSlug || !category.children) return false;
  return category.children.some((child: any) => 
    child.slug === currentSlug || isDescendantActive(child, currentSlug)
  );
};

// --- Component: Category Item (FIXED) ---
const CategoryItem = ({ category, currentSlug }: { category: any, currentSlug: string | null }) => {
  const router = useRouter();
  const isActive = currentSlug === category.slug;
  
  // Check if a child is active (to auto-expand on load)
  const hasActiveChild = useMemo(() => isDescendantActive(category, currentSlug), [category, currentSlug]);
  
  const [isOpen, setIsOpen] = useState(isActive || hasActiveChild);
  const hasChildren = category.children && category.children.length > 0;

  // Sync state only when entering the page initially or navigating TO a child
  useEffect(() => {
    if (isActive || hasActiveChild) {
      setIsOpen(true);
    }
  }, [isActive, hasActiveChild]);

  // Action 1: Toggle Fold (Arrow Click) - NO Navigation
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  // Action 2: Navigate (Text Click) - Forces Open
  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) setIsOpen(true); // Always open if we go to the parent
    if (!isActive) router.push(`/shop?category=${category.slug}`);
  };

  return (
    <div className="pl-3 border-l border-gray-100 ml-1">
      <div className="flex items-center justify-between py-1 text-sm group">
        
        {/* TEXT CLICK: Navigates */}
        <span 
          onClick={handleNavigate}
          className={`cursor-pointer flex-1 transition-colors ${
            isActive ? 'font-bold text-black' : 'text-gray-500 hover:text-black'
          }`}
        >
          {category.name}
        </span>

        {/* ARROW CLICK: Toggles only */}
        {hasChildren && (
          <button 
            onClick={handleToggle}
            className="p-1 text-gray-300 hover:text-black hover:bg-gray-100 rounded transition-colors"
          >
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}
      </div>
      
      {/* Children Container */}
      {hasChildren && isOpen && (
        <div className="mt-1 space-y-1 animate-fadeIn">
          {category.children.map((child: any) => (
            <CategoryItem key={child.id} category={child} currentSlug={currentSlug} />
          ))}
        </div>
      )}
    </div>
  );
};

// --- Main Sidebar Component ---
export default function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');
  const currentBrand = searchParams.get('brand');
  
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  // Fetch Categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories-all'],
    queryFn: async () => {
      const res = await axiosInstance.get('/api/categories?tree=true', { isPublic: true });
      return res.data;
    },
    staleTime: 1000 * 60 * 30,
  });

  // Fetch Brands
  const { data: brands = [] } = useQuery({
    queryKey: ['brands-all'],
    queryFn: async () => (await axiosInstance.get('/api/brands', { isPublic: true })).data,
    staleTime: 1000 * 60 * 30,
  });

  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set('minPrice', minPrice); else params.delete('minPrice');
    if (maxPrice) params.set('maxPrice', maxPrice); else params.delete('maxPrice');
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <aside className="w-full md:w-64 flex-shrink-0 space-y-10 pr-4 md:border-r border-transparent md:border-gray-50">
      
      {/* CATEGORIES */}
      <div>
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-900 mb-4 flex items-center gap-2">
          <Layers size={14} /> Categories
        </h3>
        <div className="space-y-1">
          <div 
            onClick={() => router.push('/shop')}
            className={`pl-3 border-l ml-1 py-1 cursor-pointer text-sm hover:text-black ${!currentCategory ? 'font-bold border-black text-black' : 'border-transparent text-gray-500'}`}
          >
            All Products
          </div>

          {categoryTree.map((cat: any) => (
            <CategoryItem 
              key={cat.id} 
              category={cat} 
              currentSlug={currentCategory} 
            />
          ))}
        </div>
      </div>

      {/* PRICE RANGE */}
      <div>
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-900 mb-4">Price Range</h3>
        <div className="flex items-center gap-2 mb-3">
          <input 
            type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded text-sm focus:border-black outline-none" placeholder="Min"
          />
          <Minus size={10} className="text-gray-400" />
          <input 
            type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded text-sm focus:border-black outline-none" placeholder="Max"
          />
        </div>
        <button onClick={applyPriceFilter} className="w-full py-2 bg-gray-900 text-white text-xs font-bold uppercase rounded hover:bg-black">
          Apply
        </button>
      </div>

      {/* BRANDS */}
      <div>
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-900 mb-4">Brands</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
          {brands.map((brand: any) => {
            const isSelected = currentBrand === brand.name;
            return (
              <div 
                key={brand.id} 
                onClick={() => {
                   const params = new URLSearchParams(searchParams.toString());
                   isSelected ? params.delete('brand') : params.set('brand', brand.name);
                   router.push(`/shop?${params.toString()}`);
                }}
                className="flex items-center gap-3 cursor-pointer group hover:bg-gray-50 p-1 rounded"
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-black border-black' : 'border-gray-300'}`}>
                  {isSelected && <Check size={10} className="text-white" />}
                </div>
                <span className={`text-sm ${isSelected ? 'font-bold text-black' : 'text-gray-600'}`}>
                  {brand.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </aside>
  );
}