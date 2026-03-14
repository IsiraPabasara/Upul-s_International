'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const AboutPage = () => {
  return (
    <main className="w-full bg-white font-outfit selection:bg-black selection:text-white">
    
      <section className="py-24 px-5 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-black mb-6">The Journey</h2>
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

    </main>
  );
};

export default AboutPage;