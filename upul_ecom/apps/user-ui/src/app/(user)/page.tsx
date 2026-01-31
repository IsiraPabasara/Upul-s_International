'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, EffectFade, Pagination } from "swiper/modules";
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/app/utils/axiosInstance';
import ProductCard from '@/app/(user)/shared/shop-components/ProductCard';
import BrandMarquee from './shared/widgets/brandsMarquee';

// --- Components ---

// // Essential Swiper Styles
// import "swiper/css";
// import "swiper/css/navigation";
// import "swiper/css/pagination";
// import "swiper/css/effect-fade";
// 

// const Hero = () => {
//   const bannerImages = [
//     {
//       id: 1,
//       // Desktop: Wide landscape aspect ratio
//       desktopUrl: "https://thilakawardhana.com/cdn/shop/files/IMG_7277_JPG.jpg?v=1769587092&width=2000",
//       // Mobile: Vertical/Portrait aspect ratio
//       mobileUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop",
//       alt: "Seasonal Collection",
//     },
//     {
//       id: 2,
//       desktopUrl: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2574&auto=format&fit=crop",
//       mobileUrl: "https://images.unsplash.com/photo-1617647858823-2424b6dc472f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGJsYXplcnxlbnwwfHwwfHx8MA%3D%3D",
//       alt: "New Arrivals",
//     },
//   ];

//   return (
//     <section className="w-full bg-black">
//       <Swiper
//         modules={[Autoplay, Navigation, Pagination, EffectFade]}
//         effect="fade"
//         slidesPerView={1}
//         loop={true}
//         autoplay={{ delay: 5000, disableOnInteraction: false }}
//         pagination={{ clickable: true }}
//         className="w-full h-[calc(100vh-108px)] md:h-[calc(100vh-145px)]"
//       >
//         {bannerImages.map((banner) => (
//           <SwiperSlide key={banner.id} className="w-full h-full">
//             <div className="w-full h-full relative">
              
//               {/* DESKTOP IMAGE: Shown on md screens and up */}
//               <img
//                 src={banner.desktopUrl}
//                 alt={banner.alt}
//                 className="hidden md:block w-full h-full object-cover"
//               />

//               {/* MOBILE IMAGE: Shown on small screens, hidden on md and up */}
//               <img
//                 src={banner.mobileUrl}
//                 alt={banner.alt}
//                 className="block md:hidden w-full h-full object-cover"
//               />

//             </div>
//           </SwiperSlide>
//         ))}
//       </Swiper>

//       <style jsx global>{`
//         .swiper-pagination-bullet {
//           background: white !important;
//           opacity: 0.7;
//         }
//         .swiper-pagination-bullet-active {
//           opacity: 1;
//         }
//       `}</style>
//     </section>
//   );
// };

// 1. Hero Section
const Hero = () => {
  return (
    <section className="relative h-[calc(100vh-108px)] md:h-[calc(100vh-145px)] w-full overflow-hidden bg-black text-white font-outfit">
      <div className="absolute inset-0 opacity-70">
        <img
          src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=2574&auto=format&fit=crop"
          alt="Hero Background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 h-full max-w-8xl mx-auto flex flex-col justify-between px-5 pb-12 pt-32">
        <div className="flex justify-between items-start">
          <p className="text-xs font-bold uppercase tracking-[0.2em] border-l-2 border-white pl-4 max-w-[200px]">
            Redefining modern silhouette through structure and chaos.
          </p>
        </div>

        <div>
          <motion.h1
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-[14vw] leading-[0.8] font-cormorant font-black tracking-tighter uppercase"
          >
            Tradition
          </motion.h1>
          <div className="flex flex-col md:flex-row justify-between items-end mt-4 border-t border-white/20 pt-6">
            <span className="text-xs uppercase tracking-[0.2em]">Est. 1940 — Ratnapura / Bandarawela</span>
            <Link href="/shop" className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest mt-6 md:mt-0">
              Explore Collection
              <ArrowUpRight className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

// 2. Marquee
const Marquee = () => {
  return (
    <div className="w-full bg-white py-4 overflow-hidden border-b border-black font-outfit">
      <div className="whitespace-nowrap animate-marquee flex gap-12">
        {[...Array(10)].map((_, i) => (
          <span key={i} className="text-4xl md:text-6xl font-black uppercase text-transparent stroke-text tracking-tighter opacity-20">
            UPUL'S
          </span>
        ))}
      </div>
      <style jsx>{`
        .stroke-text { -webkit-text-stroke: 1px black; }
        .animate-marquee { animation: marquee 20s linear infinite; }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

const CollectionPreview = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['new-arrivals-preview'],
    queryFn: async () => {
      const res = await axiosInstance.get('/api/products/shop?isNewArrival=true&limit=8', { isPublic: true });
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const products = data?.products || [];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      // Adjusted to scroll by a slightly smaller amount to keep context
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-white py-20 border-b border-gray-50 font-outfit">
      <div className="max-w-8xl mx-auto px-5">
        
        {/* Header - Now simpler without arrows */}
        <div className="flex items-end justify-between mb-10 pb-4 border-b border-gray-100">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-gray-900">
              New Arrivals
            </h2>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Latest from the studio
            </span>
          </div>

          <Link
            href="/shop?isNewArrival=true"
            className="text-[10px] font-black uppercase tracking-widest border border-black px-6 py-3 hover:bg-black hover:text-white transition-all"
          >
            View All
          </Link>
        </div>

        {/* Carousel Wrapper */}
        <div className="relative group">
          
          {/* Navigation Arrows - Absolutely Positioned */}
          <button 
            onClick={() => scroll('left')}
            className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-10 p-3 bg-white border border-gray-200 shadow-sm hover:bg-black hover:text-white transition-all hidden md:flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>

          <button 
            onClick={() => scroll('right')}
            className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-10 p-3 bg-white border border-gray-200 shadow-sm hover:bg-black hover:text-white transition-all hidden md:flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>

          {/* Scroll Container */}
          <div 
            ref={scrollRef}
            className="flex gap-x-4 md:gap-x-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-6 cursor-grab active:cursor-grabbing select-none"
          >
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="min-w-[75vw] md:min-w-[calc(25%-18px)] space-y-4 animate-pulse">
                  <div className="aspect-[3/4] bg-gray-100 rounded-sm" />
                  <div className="h-4 bg-gray-100 w-2/3" />
                </div>
              ))
            ) : (
              products.map((product: any) => (
                <div
                  key={product.id}
                  className="min-w-[75vw] md:min-w-[calc(25%-18px)] snap-start snap-always"
                >
                  <ProductCard product={product} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};

// 4. Featured Categories
const FeaturedCategories = () => {
  return (
    <section className="bg-white py-20 font-outfit">
      <div className="max-w-8xl mx-auto px-5">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <h2 className="text-4xl md:text-6xl font-cormorant font-medium tracking-tight text-black leading-none">
            The Curated <br /> Edit.
          </h2>
          <Link href="/shop" className="text-xs font-bold uppercase tracking-[0.2em] border-b border-black pb-1 hover:opacity-50 transition-opacity">
            View All Categories
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 w-full">
          <div className="md:col-span-7 h-[500px] md:h-[650px] relative group overflow-hidden bg-gray-100">
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2670&auto=format&fit=crop"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute bottom-6 left-6 bg-white px-6 py-4 z-10">
              <span className="block text-xs font-bold uppercase tracking-widest text-gray-400">01</span>
              <span className="block text-xl font-cormorant font-bold text-black">Outerwear</span>
            </div>
          </div>

          <div className="md:col-span-5 flex flex-col gap-4 md:gap-6 h-auto md:h-[650px]">
            <div className="h-[300px] md:h-auto md:flex-1 relative group overflow-hidden bg-gray-100">
              <img
                src="https://images.unsplash.com/photo-1622519407650-3df9883f76a5?q=80&w=764&auto=format&fit=crop"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute bottom-6 left-6 bg-white/90 px-6 py-4 z-10">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">02</span>
              <span className="block text-xl font-cormorant font-bold text-black">Men</span>
            </div>
            </div>

            <div className="h-[300px] md:h-auto md:flex-1 relative group overflow-hidden bg-gray-100">
              <img
                src="https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?q=80&w=1170&auto=format&fit=crop"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-6 left-6 bg-white/90 px-6 py-4 z-10">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">03</span>
              <span className="block text-xl font-cormorant font-bold text-black">Accessories</span>
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* -------------------------------
   5. Lookbook (Mobile + Desktop)
-------------------------------- */

// Desktop (EXACT your first Lookbook code)
const LookbookDesktop = () => {
  return (
    <section className="bg-black text-white py-24 border-t border-white/10 font-outfit">
      <div className="max-w-8xl mx-auto px-5 grid grid-cols-1 md:grid-cols-2 gap-20">
        <div className="h-fit sticky top-24">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500 mb-4 block">
            Editorial
          </span>
          <h2 className="text-5xl md:text-7xl font-cormorant font-medium leading-[0.9] mb-8">
            Urban <br /> Solitude
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed max-w-md mb-10">
            Our latest campaign explores the quiet moments in a bustling city.
            Designed for the modern nomad.
          </p>
          <button className="bg-white text-black px-10 py-4 text-xs font-black uppercase tracking-[0.2em] hover:bg-gray-200 transition-colors">
            Shop The Look
          </button>
        </div>

        <div className="flex flex-col gap-12">
          {[
            "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=2673&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1600091166971-7f9faad6c1e2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGJsYXplcnxlbnwwfHwwfHx8MA%3D%3D",
          ].map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="w-full aspect-[3/4] bg-gray-900 overflow-hidden"
            >
              <img src={src} className="w-full h-full object-cover" alt={`Lookbook ${i}`} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Mobile (swipe version)
const LookbookMobile = () => {
  const images = [
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=2673&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600091166971-7f9faad6c1e2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGJsYXplcnxlbnwwfHwwfHx8MA%3D%3D",
    
  ];

  return (
    <section className="bg-black text-white py-20 border-t border-white/10 font-outfit overflow-hidden">
      <div className="max-w-8xl mx-auto px-5 grid grid-cols-1 gap-12">
        <div className="h-fit z-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-4 block">
            Editorial
          </span>
          <h2 className="text-5xl font-cormorant font-medium leading-[0.9] mb-6">
            Urban Solitude
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed max-w-md mb-8">
            Our latest campaign explores the quiet moments in a bustling city.
            Designed for the modern nomad.
          </p>
          <button className="w-full bg-white text-black px-10 py-4 text-xs font-black uppercase tracking-[0.2em] hover:bg-gray-200 transition-colors">
            Shop The Look
          </button>
        </div>

        <div className="relative">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-5 px-5">
            {images.map((src, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="min-w-[85vw] aspect-[3/4] bg-gray-900 overflow-hidden snap-center"
              >
                <img src={src} className="w-full h-full object-cover" alt={`Lookbook ${i}`} />
              </motion.div>
            ))}
          </div>

          <div className="flex gap-1 mt-6">
            {images.map((_, i) => (
              <div key={i} className="h-[2px] w-8 bg-white/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-white transform -translateX-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};

// Wrapper: show one OR the other
const Lookbook = () => {
  return (
    <>
      <div className="block md:hidden">
        <LookbookMobile />
      </div>

      <div className="hidden md:block">
        <LookbookDesktop />
      </div>
    </>
  );
};

// 6. Footer
const Footer = () => {
  return (
    <footer className="bg-white pt-20 pb-10 border-t border-gray-200 font-outfit">
      <div className="max-w-8xl mx-auto px-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="md:col-span-2">
            <h3 className="text-xl font-cormorant font-black uppercase tracking-tight mb-6">V O I D</h3>
            <div className="flex flex-col gap-2 max-w-xs">
              <p className="text-sm text-gray-500">Subscribe for exclusive deals.</p>
              <div className="flex gap-2 mt-4 border-b border-black pb-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full outline-none text-sm placeholder:text-gray-400 font-medium bg-transparent"
                />
                <button className="text-xs font-bold uppercase tracking-widest">Submit</button>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">Shop</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><a href="#" className="hover:text-gray-500 transition-colors">New Arrivals</a></li>
              <li><a href="#" className="hover:text-gray-500 transition-colors">Men</a></li>
              <li><a href="#" className="hover:text-gray-500 transition-colors">Women</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">Company</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><a href="#" className="hover:text-gray-500 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-gray-500 transition-colors">Legal</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end border-t border-gray-100 pt-8">
          <h1 className="text-[12vw] leading-[0.75] font-cormorant font-black text-gray-100 select-none pointer-events-none -ml-2">VOID</h1>
          <div className="flex gap-6 text-[10px] uppercase font-bold tracking-widest text-gray-400 pb-2">
            <span>© 2026 Void Studios</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function HomePage() {
  useEffect(() => {
      // Use 'instant' for an immediate jump to the top
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant', 
      });
    }, [])

  return (
    <main className="w-full min-h-screen font-outfit selection:bg-black selection:text-white">
      <Hero />
      {/* <Marquee /> */}
      <div className=''>
        <BrandMarquee/>
      </div>
      <CollectionPreview />
      <FeaturedCategories />
      <Lookbook />
      
      <Footer />
    </main>
  );
}
