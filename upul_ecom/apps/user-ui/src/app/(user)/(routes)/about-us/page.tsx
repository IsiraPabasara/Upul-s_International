'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const AboutPage = () => {
  return (
    <main className="w-full min-h-screen bg-white font-outfit selection:bg-black selection:text-white">
      
      {/* 1. HERO - THE LEGACY */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1556905200-279565513a2d?q=80&w=2070&auto=format&fit=crop" 
            className="w-full h-full object-cover grayscale opacity-40"
            alt="Tailoring Heritage"
          />
        </div>
        <div className="relative z-10 text-center px-5">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="block text-xs font-bold uppercase tracking-[0.5em] text-gray-500 mb-4"
          >
            Since 1980
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-cormorant font-medium text-black leading-none"
          >
            Our Heritage. <br /> Your <span className="italic">Identity.</span>
          </motion.h1>
        </div>
      </section>

      {/* 2. THE STORY - TWO COLUMNS */}
      <section className="py-24 px-5 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">The Journey</h2>
            <p className="text-3xl md:text-4xl font-cormorant text-black leading-tight mb-8">
              Born in the heart of Ratnapura, Upul's International began with a simple vision: to redefine elegance through the art of tailoring.
            </p>
          </div>
          <div className="space-y-6 text-gray-600 font-light leading-relaxed text-lg">
            <p>
              For over four decades, we have been a cornerstone of Sri Lankan fashion. What started as a small atelier dedicated to bespoke craftsmanship has grown into a premier destination for those who seek more than just clothing—they seek a statement.
            </p>
            <p>
              Our philosophy is rooted in the "Curated Edit." We don't just follow trends; we curate timeless silhouettes that empower the modern professional. From the boardroom to high-society events, our garments are designed to move with you.
            </p>
          </div>
        </div>
      </section>

      {/* 3. CORE VALUES - ICONIC GRID */}
      <section className="bg-black text-white py-24 px-5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="border-t border-white/20 pt-8">
            <span className="text-4xl font-cormorant italic block mb-4">01.</span>
            <h3 className="text-xl font-bold uppercase tracking-widest mb-4">Excellence</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Every stitch is a promise of quality. We use only the finest fabrics and employ master tailors to ensure perfection in every seam.
            </p>
          </div>
          <div className="border-t border-white/20 pt-8">
            <span className="text-4xl font-cormorant italic block mb-4">02.</span>
            <h3 className="text-xl font-bold uppercase tracking-widest mb-4">Integrity</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              A legacy built on trust. Our commitment to fair pricing and honest craftsmanship has made us a household name for generations.
            </p>
          </div>
          <div className="border-t border-white/20 pt-8">
            <span className="text-4xl font-cormorant italic block mb-4">03.</span>
            <h3 className="text-xl font-bold uppercase tracking-widest mb-4">Modernity</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              While we honor our past, we look to the future. Our designs are a blend of cultural heritage and contemporary global aesthetics.
            </p>
          </div>
        </div>
      </section>

      {/* 4. THE EXPERIENCE - IMAGE WITH TEXT OVERLAY */}
      <section className="py-24 px-5 max-w-7xl mx-auto">
        <div className="relative aspect-video md:aspect-[21/9] overflow-hidden group">
          <img 
            src="https://scontent-sin2-2.xx.fbcdn.net/v/t39.30808-6/503498805_4093425077599975_6036902787313308054_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=cf85f3&_nc_eui2=AeH-GOQhadjhQAs0fjqi0EQp1BoqP2exYUHUGio_Z7FhQTKQEgjQlgUh7OUltXXV3spYNgyMo42AJLGXQrnk1NJS&_nc_ohc=BYZ1SdqiiuAQ7kNvwGDPbBV&_nc_oc=AdmHmtDyRlOwpmyp7uuiFfPMqjThTPFTNj9qdxJboPeqxI0h2UxOB1Qo9sO1KhAy2ALk3wkavx3EfCmU7b2DwtH0&_nc_zt=23&_nc_ht=scontent-sin2-2.xx&_nc_gid=uVb02HjwVZmUn3ZRgSnDZA&oh=00_Afu49pfjjj99zRc834gTEYkZkhh4NQdzQLvuJrUCmUsbNQ&oe=698A91CC" 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            alt="The Boutique Experience"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="text-center px-6">
              <h2 className="text-white text-4xl md:text-6xl font-cormorant mb-6">The Boutique Experience</h2>
              <Link href="/contact" className="text-white border-b border-white pb-1 text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity">
                Visit our Flagship Store
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER CTA */}
      <section className="pb-32 pt-12 text-center">
        <h2 className="text-3xl font-cormorant mb-10">Discover the Collection</h2>
        <div className="flex justify-center gap-8">
          <Link href="/shop" className="text-xs font-bold uppercase tracking-[0.2em] border border-black px-10 py-4 hover:bg-black hover:text-white transition-all">
            Shop Now
          </Link>
        </div>
      </section>

    </main>
  );
};

export default AboutPage;