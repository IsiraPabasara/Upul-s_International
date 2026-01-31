import Link from 'next/link';
import { ArrowUpRight} from 'lucide-react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, EffectFade, Pagination } from "swiper/modules";
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


export default Hero;