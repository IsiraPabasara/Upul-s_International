"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, EffectFade, Pagination } from "swiper/modules";

// --- Swiper Styles ---
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const Hero = () => {
  const bannerImages = [
    {
      id: 2,
      desktopUrl: "https://thilakawardhana.com/cdn/shop/files/IMG_7277_JPG.jpg?v=1769587092&width=2000",
      mobileUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop",
      alt: "Seasonal Collection",
      title: "Seasonal",
      subtitle: "The Winter Edit"
    },
    {
      id: 3,
      desktopUrl: "https://thilakawardhana.com/cdn/shop/files/Pongal_1.jpg?v=1768284039&width=2000",
      mobileUrl: "https://images.unsplash.com/photo-1617647858823-2424b6dc472f?w=500&auto=format&fit=crop&q=60",
      alt: "New Arrivals",
      title: "Arrivals",
      subtitle: "New Modern Classics"
    },
  ];

  return (
    <section className="w-full bg-black overflow-hidden">
      <Swiper
        modules={[Autoplay, Navigation, Pagination, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }} // Fixes the "overlap/see-through" issue
        slidesPerView={1}
        loop={true}
        speed={1000}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        className="w-full h-[calc(100vh-108px)] md:h-[calc(100vh-145px)]"
      >
        
        {/* --- SLIDE 1: THE TRADITION HERO --- */}
        <SwiperSlide className="bg-black w-full h-full">
          <div className="relative h-full w-full text-white font-outfit">
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=2574&auto=format&fit=crop"
                alt="Hero Background"
                className="w-full h-full object-cover opacity-70" // Solid background, slight opacity to image only
              />
            </div>

            <div className="relative z-10 h-full max-w-8xl mx-auto flex flex-col justify-between px-5 pb-16 pt-32">
              <div className="flex justify-between items-start">
                <p className="text-xs font-bold uppercase tracking-[0.2em] border-l-2 border-white pl-4 max-w-[200px]">
                  Redefining modern silhouette through structure and chaos.
                </p>
              </div>

              <div>
                <motion.h1
                  initial={{ y: 80, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
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
          </div>
        </SwiperSlide>

        {/* --- SLIDES 2 & 3: IMAGE BANNERS --- */}
        {bannerImages.map((banner) => (
          <SwiperSlide key={banner.id} className="bg-black w-full h-full">
            <div className="relative w-full h-full">
              {/* No more hover opacity overlays - using full clear image */}
              
              <img
                src={banner.desktopUrl}
                alt={banner.alt}
                className="hidden md:block w-full h-full object-cover"
              />
              <img
                src={banner.mobileUrl}
                alt={banner.alt}
                className="block md:hidden w-full h-full object-cover"
              />

              {/* <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 md:p-16 bg-gradient-to-t from-black/60 to-transparent">
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-2xl text-white"
                 >
                    <p className="text-xs uppercase tracking-[0.3em] mb-2">{banner.subtitle}</p>
                    <h2 className="text-5xl md:text-7xl font-cormorant font-light uppercase italic mb-6">{banner.title}</h2>
                    <Link href="/shop" className="inline-flex items-center gap-2 text-xs font-bold uppercase border-b border-white pb-1">
                      Shop Now <ArrowUpRight size={16} />
                    </Link>
                 </motion.div>
              </div> */}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .swiper-pagination-bullet {
          background: white !important;
          opacity: 0.5;
          transition: all 0.3s ease;
        }
        .swiper-pagination-bullet-active {
          opacity: 1;
          transform: scale(1.2);
        }
      `}</style>
    </section>
  );
};

export default Hero;