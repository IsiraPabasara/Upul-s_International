'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, ShoppingCart, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/app/utils/axiosInstance';
import { useCart } from '@/app/hooks/useCart';

export default function Header() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { toggleCart, items } = useCart();

  const { data: categories = [] } = useQuery({
    queryKey: ['categories-tree'],
    queryFn: async () => {
      const res = await axiosInstance.get('/api/categories', { isPublic: true });
      return res.data;
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/shop?search=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <header className="w-full bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="text-xl font-black">UPUL INT.</Link>
        
        <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full bg-gray-100 rounded-full py-2 px-4 pl-10 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        </form>

        <div className="flex items-center gap-5">
          <button onClick={toggleCart} className="relative">
          <ShoppingCart size={24} />
          {items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
              {items.length}
            </span>
          )}
        </button>
          <Link href="/profile"><User size={22} /></Link>
        </div>
      </div>

      <nav className="bg-white border-t overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 flex gap-8 h-12 items-center text-[13px] font-bold uppercase tracking-tight whitespace-nowrap">
          <Link href="/shop?isNewArrival=true" className="text-blue-600">New Arrivals</Link>
          {categories.filter((c:any) => !c.parentId).map((cat:any) => (
            <Link key={cat.id} href={`/shop?category=${cat.slug}`}>{cat.name}</Link>
          ))}
          <Link href="/blazers">Blazers</Link>
          <Link href="/shop?hasDiscount=true" className="text-red-500">Sale</Link>
        </div>
      </nav>
    </header>
  );
}