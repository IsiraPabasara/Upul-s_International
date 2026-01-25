'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function SortSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || 'newest';

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', e.target.value);
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-medium text-gray-500 uppercase hidden sm:block">Sort By:</label>
      <select 
        value={currentSort} 
        onChange={handleSortChange}
        className="text-sm border-none bg-transparent font-semibold focus:ring-0 cursor-pointer outline-none hover:text-gray-600"
      >
        <option value="newest">Newest Arrivals</option>
        <option value="featured">Featured</option>
        <option value="price_low_high">Price: Low to High</option>
        <option value="price_high_low">Price: High to Low</option>
        <option value="oldest">Oldest Items</option>
      </select>
    </div>
  );
}