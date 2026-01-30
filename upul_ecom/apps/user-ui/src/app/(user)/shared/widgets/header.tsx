'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, ShoppingCart, User, Heart, Menu, X, LogIn, Package, UserCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/app/utils/axiosInstance';
import { useCart } from '@/app/hooks/useCart';
import { useWishlist } from '@/app/hooks/useWishlist';
import useUser from '@/app/hooks/useUser'; 

export default function Header() {
  const [searchTerm, setSearchTerm] = useState('');
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const { user } = useUser({ required: false });
  const isLoggedIn = !!user; 

  const router = useRouter();
  const { toggleCart, items } = useCart();
  const { items: wishlistItems } = useWishlist();

  const announcements = [
    "ISLAND WIDE CASH-ON DELIVERY - SHOP NOW",
    "30% OFF ON ALL ITEMS - LIMITED TIME ONLY",
    "GLOBAL WIDE DELIVERY AVAILABLE"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [announcements.length]);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories-tree'],
    queryFn: async () => {
      const res = await axiosInstance.get('/api/categories', { isPublic: true } as any);
      return res.data;
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchTerm)}`);
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="w-full bg-white border-b sticky top-0 z-50">
      {/* Announcement Bar */}
      <div className="w-full bg-black text-white py-2 text-center text-[10px] md:text-[11px] font-bold tracking-[0.1em] uppercase transition-all duration-500">
        {announcements[announcementIndex]}
      </div>

      {/* Main Header */}
      <div className="max-w-8xl mx-auto px-4 md:px-5 h-16 md:h-20 flex items-center justify-between gap-4 md:gap-8">
        <button className="lg:hidden text-gray-800" onClick={() => setIsMenuOpen(true)}>
          <Menu size={24} />
        </button>

        <Link href="/" className="flex-shrink-0">
          <div className="flex flex-col leading-none">
            <span className="text-2xl md:text-4xl font-serif font-bold text-[#1a1a3a] tracking-tighter">U<span className="text-red-600">PUL'S</span></span>
            <span className="text-[7px] md:text-[10px] tracking-[0.3em] font-bold text-[#1a1a3a] border-t border-gray-200 pt-0.5 md:pt-1">INTERNATIONAL</span>
          </div>
        </Link>

        {/* <Link href="/" className="flex-shrink-0 group">
          <div className="relative h-10 md:h-14 w-auto flex items-center">
            <img
              src="" // Replace with your logo path
              alt="Upul's International"
              className="h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              // Setting width/height attributes helps prevent Layout Shift
              width={200} 
              height={56}
            />
          </div>
        </Link> */}

        {/* Desktop Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search For Anything"
              className="w-full border border-gray-400 py-2.5 px-4 text-sm focus:outline-none focus:border-black"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="bg-black text-white px-5 flex items-center justify-center hover:bg-zinc-800 transition-colors">
            <Search size={18} />
          </button>
        </form>

        <div className="flex items-center gap-3 md:gap-5">
          {/* PC Version Icon Logic */}
          <Link 
            href={isLoggedIn ? "/profile" : "/login"} 
            className="hidden sm:flex items-center gap-2 hover:text-red-600 transition-all text-gray-800"
          >
            <User className="w-6 h-6 md:w-7 md:h-7" strokeWidth={1.2} />
            <div className="flex flex-col -gap-1">
                <span className="text-[10px] uppercase text-gray-400 font-bold leading-none">Account</span>
                <span className="text-xs font-bold uppercase tracking-tight leading-none">
                    {isLoggedIn && user?.firstname ? `Hi, ${user.firstname}` : 'Sign In'}
                </span>
            </div>
          </Link>

          <Link href="/wishlist" className="relative text-gray-800 hover:text-red-600 transition-colors p-1">
            <Heart className="w-6 h-6 md:w-7 md:h-7" strokeWidth={1.2} />
            {wishlistItems.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          <button onClick={toggleCart} className="relative text-gray-800 hover:text-black transition-colors p-1">
            <ShoppingCart className="w-6 h-6 md:w-7 md:h-7" strokeWidth={1.2} />
            {items.length > 0 && (
              <span className="absolute top-0 right-0 bg-black text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {items.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Slider */}
      <nav className=" bg-[#f2e6e6] md:bg-[#e3e3e3]  border-t overflow-x-auto scrollbar-hide">
        <div className="max-w-8xl mx-auto px-5 flex gap-6 md:gap-10 h-11 items-center text-[12px] md:text-[13px] font-bold uppercase tracking-tight whitespace-nowrap">
          <Link href="/shop?isNewArrival=true" className="shrink-0 hover:opacity-70 transition-opacity">New Arrivals</Link>
          {categories.filter((c: any) => !c.parentId).map((cat: any) => (
            <Link key={cat.id} href={`/shop?category=${cat.slug}`} className="shrink-0 hover:opacity-70 transition-opacity">
              {cat.name}
            </Link>
          ))}
          <Link href="/blazers" className="shrink-0 hover:opacity-70 transition-opacity">Blazers</Link>
          <Link href="/shop?hasDiscount=true" className="text-red-500 shrink-0 hover:opacity-70 transition-opacity pr-4">Sale</Link>
        </div>
      </nav>

      {/* Full Screen Mobile Menu Overlay */}
      <div 
        className={`fixed block md:hidden inset-0 bg-white z-[100] transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-5 border-b">
            <span className="text-xl font-black tracking-widest uppercase">Menu</span>
            <button onClick={() => setIsMenuOpen(false)} className="p-1">
              <X size={28} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-8">
            <form onSubmit={handleSearch} className="flex mb-10">
              <input
                type="text"
                placeholder="Search..."
                className="flex-1 border-b border-gray-300 py-3 focus:outline-none focus:border-black text-lg"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="px-4"><Search size={22} /></button>
            </form>

            <div className="flex flex-col gap-6 text-xl font-bold uppercase tracking-tighter">
              <Link href="/shop?isNewArrival=true" onClick={() => setIsMenuOpen(false)}>New Arrivals</Link>
              
              {/* Main Categories */}
              {categories.filter((c: any) => !c.parentId).map((cat: any) => (
                <Link key={cat.id} href={`/shop?category=${cat.slug}`} onClick={() => setIsMenuOpen(false)}>
                  {cat.name}
                </Link>
              ))}
              
              <Link href="/blazers" onClick={() => setIsMenuOpen(false)}>Blazers</Link>
              <Link href="/shop?hasDiscount=true" className="text-red-500" onClick={() => setIsMenuOpen(false)}>Sale</Link>
              
              <hr className="border-gray-100 my-4" />
              
              {/* Conditional Auth Section BELOW categories */}
              <div className="flex flex-col gap-6">
                {isLoggedIn ? (
                  <>
                    <Link 
                        href="/profile" 
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 text-xl"
                    >
                        <UserCircle size={24} strokeWidth={1.5} />
                        My Profile
                    </Link>
                    <Link 
                        href="/profile/orders" 
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 text-xl"
                    >
                        <Package size={24} strokeWidth={1.5} />
                        My Orders
                    </Link>
                  </>
                ) : (
                  <Link 
                    href="/login" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center w-full bg-black text-white py-4 rounded-sm font-outfit uppercase tracking-[0.2em]"
                  >
                    Sign In / Register
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}