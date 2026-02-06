'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const BlazerPage = () => {
  return (
    <main className="w-full min-h-screen bg-white font-outfit selection:bg-black selection:text-white">
      
      {/* --- HERO SECTION: SIZE MATCHED TO HOME --- */}
      <section className="w-full bg-black overflow-hidden blazer-hero-container">
        <div className="relative h-full w-full text-white font-outfit">
          
          {/* Background Images with logic from Home */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1593032465175-481ac7f401a0?q=80&w=2080&auto=format&fit=crop"
              alt="Premium Blazer Collection"
              className="hidden md:block w-full h-full object-cover opacity-90"
            />
            <img
              src="https://ik.imagekit.io/aqi4rj9dnl/475852916_3968769883398829_4365346044412579781_n(1).jpg.jpeg"
              alt="Premium Blazer Mobile"
              className="block md:hidden w-full h-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
          </div>

          {/* Content Layer with Home Hero Typography */}
          <div className="relative z-10 h-full max-w-8xl mx-auto flex flex-col justify-between px-5 pb-16 pt-32">
            <div className="flex justify-between items-start">
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs sm:text-[0.3rem] md:text-[0.6rem] lg:text-sm md:mb-10 xl:mb-0 xl:text-base font-bold uppercase tracking-[0.2em] border-l-2 border-white pl-4 max-w-[200px] md:max-w-[300px]"
              >
                Redefining modern silhouette
              </motion.p>
            </div>

            <div>
              <motion.h1
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-[14vw] sm:text-[clamp(4rem,8vw,9rem)] md:text-[clamp(3.5rem,2vw,7rem)] lg:text-[clamp(6rem,9vw,10rem)] xl:text-[clamp(6rem,9vw,11rem)] leading-[0.8] font-cormorant font-black tracking-tighter uppercase"
              >
                Bespoke <br />
                <span className="italic font-light">Blazers</span>
              </motion.h1>

              <div className="flex flex-col md:flex-row justify-between items-end mt-4 border-t border-white/20 pt-6">
                <span className="text-[0.6rem] md:text-[0.65rem] lg:text-xs xl:text-sm uppercase tracking-[0.2em]">
                  Est. 1940 — Ratnapura / Bandarawela
                </span>
                
                <Link href="/shop" className="group flex items-center gap-2 text-xs md:text-[0.7rem] lg:text-sm xl:text-base font-bold uppercase tracking-widest mt-6 md:mt-0">
                  Book Now
                  <ArrowUpRight className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* CSS to exactly match Home Hero Ratios */}
        <style jsx>{`
          .blazer-hero-container {
            aspect-ratio: 1024 / 1536;
            height: auto;
          }
          @media (min-width: 768px) {
            .blazer-hero-container {
              aspect-ratio: 4000 / 1558;
              height: auto;
            }
          }
          @media (min-width: 1280px) {
            .blazer-hero-container {
              aspect-ratio: auto;
              height: calc(100vh - 145px);
            }
          }
        `}</style>
      </section>

      {/* --- BRAND PHILOSOPHY --- */}
      <section className="py-24 px-5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 items-center">
          <div className="w-full md:w-1/2">
            <h2 className="text-4xl md:text-6xl font-cormorant text-black leading-tight mb-8">
              A Legacy of <br /> Precision.
            </h2>
            <div className="space-y-6 text-gray-600 leading-relaxed text-sm md:text-base">
              <p>
                At Upul's International, a blazer is not just an outer layer—it is an architectural 
                feat. Drawing from decades of tailoring expertise, we combine structured elegance with effortless comfort.
              </p>
              <p>
                Our fabrics are sourced from the world’s finest mills, ensuring that every stitch reflects our commitment to professional excellence and premium quality.
              </p>
            </div>
          </div>
          <div className="w-full md:w-1/2 aspect-[4/5] relative bg-gray-100">
            <img 
              src="https://ik.imagekit.io/aqi4rj9dnl/upul-1.0"
              className="w-full h-full object-cover shadow-2xl"
              alt="Fine Fabric"
            />
            <div className="absolute bottom-0 left-0 md:-bottom-6 md:-left-6 bg-black text-white p-6 md:p-8">
              <p className="font-cormorant italic text-lg md:text-xl">"Tailoring is the language of confidence."</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CURATED STYLES GRID --- */}
      <section className="bg-[#fcfcfc] py-24 px-5">
        <div className="max-w-8xl mx-auto">
          <div className="flex justify-between items-end mb-16 border-b border-gray-200 pb-8">
            <h3 className="font-cormorant text-4xl text-black uppercase tracking-tight">The Collection Edit</h3>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Est. 1980</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { 
                title: "The Executive", 
                desc: "Sharply tailored for the boardroom.", 
                img: "https://scontent-sin6-3.xx.fbcdn.net/v/t39.30808-6/486527404_1307347634162962_931906689534929064_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeFudRCQNsE0ZR0o1Gm0CUPQBPIhoDKnU44E8iGgMqdTjt1VXV7x0nSKeXVQsc-cJHEKtXhw201CaYw_2rckcjvM&_nc_ohc=xO4s9arO4t0Q7kNvwFb7QUP&_nc_oc=AdkZnasbs5oTERNnChbGVT6zg5l3uAzepFvD48W5PNpssPq4CJFFAfYrZgW-26mLnucINFQpgZIhX4wPEG66ZWKM&_nc_zt=23&_nc_ht=scontent-sin6-3.xx&_nc_gid=ODTqpS7VI6n4ynxcJCkgdw&oh=00_AfvVPsk8hsLgoV1pDVfj8rb_dYGkXVvK99cAE0lYam9sdw&oe=698A9A77" 
              },
              { 
                title: "The Midnight Silk", 
                desc: "Refined elegance for evening galas.", 
                img: "https://scontent-sin2-3.xx.fbcdn.net/v/t39.30808-6/476083531_3968779740064510_8002661266866565592_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeFQkSX0K19a6mhKPYLgeLrmOgBt44SfeyY6AG3jhJ97JvmdU9otOXgRjjUrweVX0QRLuVPcBiHHysTkgz5tzXD0&_nc_ohc=kir-FmghPD0Q7kNvwEW0zn1&_nc_oc=Adlb8yM6bfvDN3V_18DhGjmt02ZkSsFwxbbX3ByjGcwLsrWxhkG7O6HCR9wGX0g_n8dZ6Uc7WNaRwz3V56m22OhB&_nc_zt=23&_nc_ht=scontent-sin2-3.xx&_nc_gid=9BNYVTIECc618ybETMAtiQ&oh=00_AfsXNU20xixsduOBRM_RE-2NmX0vgqOmkf3rTZmV5NuFzw&oe=698A988C" 
              },
              { 
                title: "The Modern Nomad", 
                desc: "Unstructured luxury for the traveler.", 
                img: "https://scontent-sin11-1.xx.fbcdn.net/v/t39.30808-6/476100502_3968782213397596_286810475246064473_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeF0QGYDuAT_hD-3mc6En2yWZg9R78LstMtmD1Hvwuy0yynWf9sobk7nUfgQTNyIX-mCDJGpBZReNnK1b5O8XhL6&_nc_ohc=2HKpkl03bdUQ7kNvwFMsA5h&_nc_oc=Adk_hHj9_XkLbzpkAmDRrYphaqNzP3BQgAbChTtsKwUcuvQOoO_zqTXPRiTM4_xnQbq6W_PzoPasAMaW1CDlEeaT&_nc_zt=23&_nc_ht=scontent-sin11-1.xx&_nc_gid=ETIhDQbCDd--kOF12Nh5MQ&oh=00_AftEi6azjO0VaPHr7Vgfqf72LKmBGtQHg_P4Ppl9NbHdsQ&oe=698A9E58" 
              }
            ].map((item, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className="aspect-[3/4] overflow-hidden bg-gray-200 mb-6">
                  <img 
                    src={item.img} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    alt={item.title}
                  />
                </div>
                <h4 className="font-cormorant text-2xl font-bold text-black">{item.title}</h4>
                <p className="text-gray-500 text-xs uppercase tracking-widest mt-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CALL TO ACTION --- */}
      <section className="py-32 bg-black text-center px-5">
        <motion.div 
          initial={{ opacity: 0 }} 
          whileInView={{ opacity: 1 }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-5xl md:text-7xl font-cormorant text-white mb-8">Elevate Your Presence.</h2>
          <p className="text-gray-400 mb-12 text-sm md:text-base font-light tracking-wide uppercase">
            Visit our Flagship Store for a <br /> personalized fitting session.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="https://www.facebook.com/UpulsInternational/" className="bg-white text-black px-12 py-5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-200 transition-all">
              Contact Now
            </Link>
          </div>
        </motion.div>
      </section>

    </main>
  );
};

export default BlazerPage;