'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight, Scissors, Ruler, Award } from 'lucide-react';

const BlazerPage = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <main className="w-full min-h-screen bg-white font-outfit selection:bg-black selection:text-white overflow-x-hidden">
      
      {/* --- HERO SECTION --- */}
      <section className="w-full bg-black overflow-hidden blazer-hero-container">
        <div className="relative h-full w-full text-white">
          <div className="absolute inset-0">
            <motion.img
              style={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2 }}
              src="http://scontent.fcmb3-2.fna.fbcdn.net/v/t39.30808-6/474770952_3965994000343084_8890485516314969605_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=127cfc&oh=00_AfvKjA9d8ftN-u7-erMu06jrTDQ2hEIJOeCdlDzdZYRPOw&oe=698BB09E"
              alt="Premium Blazer Collection"
              className="hidden md:block w-full h-full object-cover opacity-70"
            />
            <img
              src="https://ik.imagekit.io/aqi4rj9dnl/475852916_3968769883398829_4365346044412579781_n(1).jpg.jpeg"
              alt="Premium Blazer Mobile"
              className="block md:hidden w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />
          </div>

          <div className="relative z-10 h-full max-w-8xl mx-auto flex flex-col justify-between px-5 pb-12 pt-32">
            <div className="flex justify-between items-start">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-l border-white/30 pl-6"
              >
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-white/80">
                  The Gold Standard
                </p>
                <p className="text-xs md:text-sm mt-1 text-white/60">Tailored to your DNA.</p>
              </motion.div>
            </div>

            <div className="mb-8">
              <motion.h1
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="text-[15vw] md:text-[10vw] leading-[0.8] font-cormorant font-light uppercase tracking-tighter"
              >
                Art of <br />
                <span className="italic font-light ml-[5vw]">Tailoring</span>
              </motion.h1>

              <div className="flex flex-col md:flex-row justify-between items-end mt-12 border-t border-white/10 pt-8">
                <div className="flex gap-12 mb-8 md:mb-0">
                   <div className="hidden lg:block text-left">
                      <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Availability</p>
                      <p className="text-xs uppercase">Bespoke / Ready-to-wear / Rental</p>
                   </div>
                </div>
                
                <Link href="#appointment" className="group flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-widest text-white/40 mb-2 group-hover:text-white transition-colors">Start your journey</span>
                  <div className="flex items-center gap-4 bg-white text-black px-8 py-4 rounded-full hover:scale-105 transition-transform">
                    <span className="text-xs font-bold uppercase">Book a Fitting</span>
                    <ArrowUpRight size={18} />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .blazer-hero-container { aspect-ratio: 1024 / 1536; height: auto; }
          @media (min-width: 768px) { .blazer-hero-container { aspect-ratio: 4000 / 1800; height: auto; } }
          @media (min-width: 1280px) { .blazer-hero-container { height: 90vh; aspect-ratio: auto; } }
        `}</style>
      </section>

      {/* --- FLOATING CRAFTSMANSHIP SECTION --- */}
      <section className="py-32 px-5 bg-white overflow-hidden">
        <div className="max-w-8xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5 relative">
            <motion.div 
               whileInView={{ opacity: [0, 1], x: [-50, 0] }}
               className="relative z-10"
            >
              <h2 className="text-6xl md:text-8xl font-cormorant text-black leading-none mb-8">
                Built <br /> <span className="italic">to Last.</span>
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-md">
                Our blazers aren't just clothes; they are an investment in your legacy. 
                Hand-cut from premium Italian and British wool, finished with silk-thread buttonholes.
              </p>
              
              <div className="grid grid-cols-2 gap-8 mt-12">
                <div>
                  <Scissors className="mb-4 text-black" size={32} strokeWidth={1} />
                  <h4 className="font-bold uppercase text-xs tracking-tighter mb-2">Hand Cut</h4>
                  <p className="text-gray-400 text-xs uppercase leading-tight">Every panel is measured against your unique posture.</p>
                </div>
                <div>
                  <Ruler className="mb-4 text-black" size={32} strokeWidth={1} />
                  <h4 className="font-bold uppercase text-xs tracking-tighter mb-2">36-Point Check</h4>
                  <p className="text-gray-400 text-xs uppercase leading-tight">Rigorous quality control ensuring mathematical perfection.</p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 gap-4 relative">
             <motion.div 
               style={{ y: -20 }}
               whileInView={{ y: 20 }}
               transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
               className="aspect-[3/5] bg-gray-100 overflow-hidden translate-y-12"
             >
                <img src="https://ik.imagekit.io/aqi4rj9dnl/upul-1.0" className="w-full h-full object-cover" alt="Detail" />
             </motion.div>
             <motion.div 
               style={{ y: 20 }}
               whileInView={{ y: -20 }}
               transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse" }}
               className="aspect-[3/5] bg-gray-200 overflow-hidden"
             >
                <img src="https://images.unsplash.com/photo-1594932224491-994c9295ba73?q=80&w=1000" className="w-full h-full object-cover" alt="Detail" />
             </motion.div>
          </div>
        </div>
      </section>

      {/* --- SERVICE PILLARS (The "Wow" Component) --- */}
      <section className="bg-black py-24 px-5 text-white">
        <div className="max-w-8xl mx-auto flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/10">
          {[
            { title: "Personal Tailoring", icon: <Scissors />, desc: "Created from scratch to your exact measurements." },
            { title: "Premium Rental", icon: <Award />, desc: "Access the world's finest labels for your special night." },
            { title: "Rapid Alterations", icon: <Ruler />, desc: "Precision adjustments for a flawless silhouette." }
          ].map((s, i) => (
            <div key={i} className="py-12 md:py-0 md:px-12 group cursor-default">
              <div className="mb-6 opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
                {React.cloneElement(s.icon, { size: 40, strokeWidth: 1 })}
              </div>
              <h3 className="text-2xl font-cormorant mb-4">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed group-hover:text-white transition-colors">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- GALLERY EDITORIAL --- */}
      <section className="py-32 bg-[#fafafa] px-5">
        <div className="max-w-8xl mx-auto">
          <div className="text-center mb-24">
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-gray-400">The 2026 Lookbook</span>
            <h2 className="text-5xl md:text-7xl font-cormorant mt-4">Curated Silhouettes</h2>
          </div>

          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {[
              "https://scontent-sin6-3.xx.fbcdn.net/v/t39.30808-6/486527404_1307347634162962_931906689534929064_n.jpg?_nc_cat=110&oh=00_AfvVPsk8hsLgoV1pDVfj8rb_dYGkXVvK99cAE0lYam9sdw&oe=698A9A77",
              "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?q=80&w=1000",
              "https://scontent-sin2-3.xx.fbcdn.net/v/t39.30808-6/476083531_3968779740064510_8002661266866565592_n.jpg?_nc_cat=107&oh=00_AfsXNU20xixsduOBRM_RE-2NmX0vgqOmkf3rTZmV5NuFzw&oe=698A988C",
              "https://images.unsplash.com/photo-1598808503490-85d6499d328e?q=80&w=1000",
              "https://scontent-sin11-1.xx.fbcdn.net/v/t39.30808-6/476100502_3968782213397596_286810475246064473_n.jpg?_nc_cat=105&oh=00_AftEi6azjO0VaPHr7Vgfqf72LKmBGtQHg_P4Ppl9NbHdsQ&oe=698A9E58",
              "https://images.unsplash.com/photo-1555069519-03463b5f8935?q=80&w=1000"
            ].map((url, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -10 }}
                className="break-inside-avoid overflow-hidden bg-gray-200 group relative"
              >
                <img src={url} className="w-full grayscale group-hover:grayscale-0 transition-all duration-700 cursor-crosshair" alt="Collection" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <p className="text-white uppercase text-[10px] tracking-widest font-bold">View Details</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- LUXURY CTA --- */}
      <section id="appointment" className="py-40 bg-black text-white px-5 overflow-hidden relative">
        <motion.div 
          style={{ opacity: 0.1 }}
          className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
        >
           <h2 className="text-[30vw] font-black uppercase whitespace-nowrap">UPUL'S</h2>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          whileInView={{ opacity: 1, scale: 1 }}
          className="max-w-3xl mx-auto text-center relative z-10"
        >
          <h2 className="text-6xl md:text-8xl font-cormorant mb-12 leading-tight">Define Your <br /> Final Form.</h2>
          <p className="text-gray-400 mb-16 text-sm md:text-lg font-light tracking-wide uppercase">
            Available for custom orders and premium rentals in <br /> Ratnapura and Bandarawela.
          </p>
          <Link href="https://www.facebook.com/UpulsInternational/" className="inline-block border border-white/20 px-16 py-6 text-xs font-bold uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-500">
            Secure an Appointment
          </Link>
        </motion.div>
      </section>

    </main>
  );
};

export default BlazerPage;