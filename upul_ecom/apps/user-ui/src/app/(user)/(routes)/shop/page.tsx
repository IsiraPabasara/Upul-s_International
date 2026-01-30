'use client';

import { useState, useCallback } from 'react'; // Import useCallback
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/app/utils/axiosInstance';
import FilterSidebar from '@/app/(user)/shared/shop-components/FilterSidebar';
import SortSection from '@/app/(user)/shared/shop-components/SortSection';
import ProductCard from '@/app/(user)/shared/shop-components/ProductCard';
import Pagination from '@/app/(user)/shared/shop-components/Pagination';
import { Filter } from 'lucide-react';

interface ShopResponse {
  products: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function ShopPage() {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search');
  const categorySlug = searchParams.get('category');

  // --- Mobile Filter State ---
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Use callback to keep function reference stable
  const closeMobileFilters = useCallback(() => {
    setIsMobileFiltersOpen(false);
  }, []);

  // Default to page 1 if not in URL
  const currentPage = Number(searchParams.get('page')) || 1;

  const { data, isLoading } = useQuery<ShopResponse>({
    queryKey: ['shop-products', searchParams.toString()],
    queryFn: async () => {
      const res = await axiosInstance.get(`/api/products/shop?${searchParams.toString()}`, { isPublic: true });
      return res.data;
    },
    staleTime: 1000 * 60 * 2,
    placeholderData: (previousData) => previousData,
  });

  const products = data?.products || [];
  const pagination = data?.pagination || { total: 0, page: 1, totalPages: 1 };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      {/* <div className="border-b border-gray-100 bg-gray-50/50">
        <div className="max-w-8xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 capitalize">
            {searchTerm ? `Results: "${searchTerm}"` : categorySlug ? categorySlug.replace(/-/g, ' ') : 'Shop'}
          </h1>
          <p className="text-sm text-gray-500">
            {!isLoading && pagination.total > 0 && (
              <>
                Showing <span className="font-bold">{(pagination.page - 1) * 12 + 1}</span> -{' '}
                <span className="font-bold">{Math.min(pagination.page * 12, pagination.total)}</span> of{' '}
                <span className="font-bold">{pagination.total}</span> results
              </>
            )}
          </p>
        </div>
      </div> */}

      <div className="max-w-8xl mx-auto px-5 py-10">
        <div className="flex flex-col md:flex-row gap-10">
          
          {/* SIDEBAR */}
          <FilterSidebar 
            isOpen={isMobileFiltersOpen} 
            onClose={closeMobileFilters} 
          />

          {/* MOBILE CONTROLS */}
          <div className="md:hidden flex justify-between items-center mb-4">
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="flex items-center gap-2 text-sm font-bold border border-gray-200 px-4 py-2 rounded-lg bg-white hover:bg-gray-50 transition-colors"
            >
              <Filter size={16} /> Filters
            </button>
            <SortSection />
          </div>

          {/* PRODUCTS MAIN */}
          <main className="flex-1">
            <div className="hidden md:flex justify-end mb-6 pb-4 border-b border-gray-100">
              <SortSection />
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="space-y-3">
                    <div className="aspect-[3/4] bg-gray-100 rounded-xl" />
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                  {products.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <Pagination 
                  currentPage={pagination.page} 
                  totalPages={pagination.totalPages} 
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
                <p className="text-lg font-medium text-gray-900">No products found</p>
                <button
                  onClick={() => (window.location.href = '/shop')}
                  className="mt-4 text-sm font-bold text-black underline underline-offset-4"
                >
                  Clear filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}