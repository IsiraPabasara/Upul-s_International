'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import BrandMarquee from './shared/widgets/brandsMarquee';
import Hero from './shared/widgets/banner';
import CollectionPreview from './shared/widgets/CollectionPreview';




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
     
      <CollectionPreview />
       <div className='mt-[px]'>
        <BrandMarquee/>
      </div>
      <FeaturedCategories />
      <Lookbook />
      
      
    </main>
  );
}
