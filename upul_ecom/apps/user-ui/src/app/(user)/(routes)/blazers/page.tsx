'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight, Scissors, Award, Ruler } from 'lucide-react';

const BlazerPage = () => {
  return (
    <main className="w-full min-h-screen bg-white font-outfit selection:bg-black selection:text-white">
      
      {/* --- HERO SECTION: SIZE MATCHED TO HOME --- */}
      <section className="w-full bg-black overflow-hidden blazer-hero-container">
        <div className="relative h-full w-full text-white font-outfit">
          
          {/* Background Images with logic from Home */}
          <div className="absolute inset-0">
            <img
              src="http://scontent.fcmb3-2.fna.fbcdn.net/v/t39.30808-6/474770952_3965994000343084_8890485516314969605_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeGkgNm7jrOyIXb_2fvYyUudUSPhk4iuh7RRI-GTiK6HtKYSgIvlpJHq7kStnaYCUoqrG65DlovxGCSKCP6nwGX0&_nc_ohc=vYsCUydazIgQ7kNvwEmEcd_&_nc_oc=AdnMyp7V8ewSphCGJT-ixx9yBIBVUoKNHhjs0NDM82JBgSvDfcd6uGK4yeVvMpetb_AEPHswvi2O3Sk0vK6AkzAu&_nc_zt=23&_nc_ht=scontent.fcmb3-2.fna&_nc_gid=MNcZc9hYC7HJrHFL6NJFYQ&oh=00_AfvKjA9d8ftN-u7-erMu06jrTDQ2hEIJOeCdlDzdZYRPOw&oe=698BB09E"
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
          <div className="relative z-10 h-full max-w-8xl mx-auto flex flex-col justify-between px-5 pb-10 md:pb-16 pt-20 lg:pt-32">
  
          <div className="flex justify-between items-start">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs sm:text-[0.3rem] md:text-[0.6rem] lg:text-sm xl:text-base font-bold uppercase tracking-[0.2em] border-l-2 border-white pl-4 max-w-[200px] md:max-w-[300px]"
            >
              <p className="text-[10px] sm:text-[10px] lg:text-xs font-bold uppercase tracking-[0.3em] text-white/80">
                  The Gold Standard
                </p>
                <p className="text-xs   sm:text-[10px] lg:text-sm mt-1 text-white/60">Tailored to your DNA.</p>
            </motion.div>
          </div>

          <div>
            {/* 2. Tightened leading (line height) for the H1 to prevent it from pushing the bottom row down */}
            <motion.h1
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-[14vw] sm:mt-7 lg:mt-0  sm:text-[clamp(3.5rem,4vw,6rem)] lg:text-[clamp(6rem,9vw,10rem)] xl:text-[clamp(6rem,9vw,11rem)] leading-[0.75] font-cormorant font-black tracking-tighter uppercase"
            >
              Bespoke <br />
              <span className="italic font-light">Blazers</span>
            </motion.h1>

            {/* 3. Reduced mt-4 to mt-2 for tablet to keep everything compact */}
            <div className="flex flex-col md:flex-row justify-between items-end mt-2 md:mt-4 border-t border-white/20 pt-4 md:pt-6">
              <span className="text-[0.6rem] md:text-[0.65rem] lg:text-xs xl:text-sm uppercase tracking-[0.2em]">
                Est. 1940 — Ratnapura / Bandarawela
              </span>
              
              <Link href="/shop" className="group flex items-center gap-2 text-xs md:text-[0.7rem] lg:text-sm xl:text-base font-bold uppercase tracking-widest mt-4 md:mt-0">
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

      

      {/* --- HOW IT WORKS / THE PROCESS --- */}
<section className="py-24 px-5 bg-white">
  <div className="max-w-8xl mx-auto">
    {/* Section Header */}
    <div className="text-center mb-20">
      <h2 className="text-4xl md:text-5xl font-cormorant text-black uppercase tracking-tight">
        How it works
      </h2>
      <div className="w-12 h-[1px] bg-black mx-auto mt-4 opacity-30" />
    </div>

    {/* Steps Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24">
      
      {/* Step 1 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-col items-center text-center group"
      >
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gray-50 rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 p-4 border border-gray-100 rounded-full group-hover:border-black transition-colors duration-500">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-black">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
            </svg>
          </div>
        </div>
        <h3 className="font-outfit text-[11px] font-black uppercase tracking-[0.2em] mb-4 text-black">
          Select the Blazer Fabric
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed max-w-xs font-light">
          New Trendy blazers fabrics for every season. Find a wide range of fabrics every season for your tailored blazers.
        </p>
      </motion.div>

      {/* Step 2 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center text-center group"
      >
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gray-50 rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 p-4 border border-gray-100 rounded-full group-hover:border-black transition-colors duration-500">
            {/* Custom Blazer SVG Icon */}
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-black">
               <path d="M6 2L3 10V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V10L18 2H6Z" />
               <path d="M6 2L12 10L18 2" />
               <path d="M12 10V22" />
            </svg>
          </div>
        </div>
        <h3 className="font-outfit text-[11px] font-black uppercase tracking-[0.2em] mb-4 text-black">
          Design Your Custom Blazer
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed max-w-xs font-light">
          Personalize your blazer details: lapels, threads, inner lining, pocket squares... Endless options!
        </p>
      </motion.div>

      {/* Step 3 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="flex flex-col items-center text-center group"
      >
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gray-50 rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 p-4 border border-gray-100 rounded-full group-hover:border-black transition-colors duration-500">
            <Ruler size={40} strokeWidth={1} className="text-black" />
          </div>
        </div>
        <h3 className="font-outfit text-[11px] font-black uppercase tracking-[0.2em] mb-4 text-black">
          Insert Your Measurements
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed max-w-xs font-light">
          So you can get the perfect fitting custom sport coat online, or visit us in-store for a professional session.
        </p>
      </motion.div>

    </div>
  </div>
</section>

      {/* --- CURATED STYLES GRID --- */}
      {/* <section className="bg-[#fcfcfc] py-24 px-5">
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
      </section> */}

      <section className="py-32 bg-[#fafafa] px-5">
              <div className="max-w-8xl mx-auto">
                <div className="text-center mb-24">
                  <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-gray-400">The 2026 Lookbook</span>
                  <h2 className="text-5xl md:text-7xl font-cormorant mt-4">Curated Silhouettes</h2>
                </div>
      
                <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                  {[
                    "https://scontent.fcmb3-2.fna.fbcdn.net/v/t39.30808-6/474770952_3965994000343084_8890485516314969605_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeGkgNm7jrOyIXb_2fvYyUudUSPhk4iuh7RRI-GTiK6HtKYSgIvlpJHq7kStnaYCUoqrG65DlovxGCSKCP6nwGX0&_nc_ohc=vYsCUydazIgQ7kNvwEmEcd_&_nc_oc=AdnMyp7V8ewSphCGJT-ixx9yBIBVUoKNHhjs0NDM82JBgSvDfcd6uGK4yeVvMpetb_AEPHswvi2O3Sk0vK6AkzAu&_nc_zt=23&_nc_ht=scontent.fcmb3-2.fna&_nc_gid=MNcZc9hYC7HJrHFL6NJFYQ&oh=00_AfvKjA9d8ftN-u7-erMu06jrTDQ2hEIJOeCdlDzdZYRPOw&oe=698BB09E",
                    "https://scontent.fcmb3-2.fna.fbcdn.net/v/t39.30808-6/475881868_3968782026730948_6852112193673731329_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeHocVI46VZoLOFpxUzfYlcRyhrjN9cacdPKGuM31xpx05_ywG-WzKGSToaQAwzc1J-bu-hBSoyRvbmrTBL5KRif&_nc_ohc=ZCsMFrCmxmYQ7kNvwGoOq7O&_nc_oc=Adl4rmaOoC0AhJEymVMFdIkEeKmCqZWi2WOtQka2Lsm-6ZrHmSkiX9k1zL4aX9iactZaLnpFWj5wZMondOJwC_de&_nc_zt=23&_nc_ht=scontent.fcmb3-2.fna&_nc_gid=GImV4NCQOwa-ypk-XwitgQ&oh=00_Afu5rzjRSdIb27mPWzF1bI8cvjY2Uq5O1q3ducAegpoarA&oe=698BCD9C",
                    "https://scontent.fcmb3-2.fna.fbcdn.net/v/t39.30808-6/475727000_3968781986730952_6660118627184426245_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeFKb45Y44aAEwRyTXqceRLDrCBLynbtk5WsIEvKdu2TlWFNsCGM6LNJy47LWiyO0TLdhFjcg19Obd6tJTkZMYyh&_nc_ohc=gZyga5b2PIAQ7kNvwECNdG_&_nc_oc=Adk-iaho0xocOh5tjJvw3vgs1qzW_AKiMlDlA1JgmaTa-JMzNgnTXim6RWM0OU2wKz3C6WSUAX6y7H1-doNSLtxb&_nc_zt=23&_nc_ht=scontent.fcmb3-2.fna&_nc_gid=DNI9yxkNMDEUmmE6Ht2DyA&oh=00_AfuhFf8vsFQk2GEVo6IhZwSBFNVbydGtblSI_mw03krxtA&oe=698BB032",
                    "https://scontent.fcmb3-3.fna.fbcdn.net/v/t39.30808-6/478088326_3977118219230662_1170138477442918277_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeEUH0Fr5KqgLt_DGkdVzi_qzTNGX4ZgNATNM0ZfhmA0BO-xLS-ONh4Pcp6yx4mzyoJi8Ra0RuCyk7LFVnc2jN0Q&_nc_ohc=_cyBfNU3Q1AQ7kNvwGjK-lW&_nc_oc=AdkdlctuZqP5KklpsD0vzb56Oj3dLdXzT219zmv5XMrRNlfIPpTEv8IogI1-86rvqQnFbolfClMJNaWTFkfpfZO3&_nc_zt=23&_nc_ht=scontent.fcmb3-3.fna&_nc_gid=oMdEQHppSjg7CtwQbf70fQ&oh=00_AftG1VH1ap0FlusVkGeTSuqfxd121CLK-Y3Sn4eRvE8axg&oe=698BACDC",
                    "https://scontent.fcmb3-3.fna.fbcdn.net/v/t39.30808-6/474927423_3969424746666676_5049846291240147153_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeGLWeWwqtRyFTS4vPF_EyA-USmGZ0i12JVRKYZnSLXYlSfq2gdK2S9fQRioFtIxQUTKDLUArfqWZmwNAntKpxqd&_nc_ohc=ql6BaCfiQVoQ7kNvwEktG3l&_nc_oc=Adn07YutozlDXdL_Jbs4R_1aHqMAy2DYXk6LHBhrWrwIPYLkq7R7YTeKK-yaLkNRcwVAz-ogS3iOMh_qY33LmXd9&_nc_zt=23&_nc_ht=scontent.fcmb3-3.fna&_nc_gid=8ThHqsF1Thm8sJclSQ3ogA&oh=00_AfvRtzw1ZLl_xfYSbaDgJ8naOJCjudfZdk2wzsZ4ZA4Cfg&oe=698BB985",
                    "https://scontent.fcmb12-1.fna.fbcdn.net/v/t39.30808-6/475641208_3969424456666705_2383408710235459154_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeFyAUm2PWeRWcS0OF2d2tr-gBKooaxKXeaAEqihrEpd5q4LHASI8OYp-PGFuC7tusqP1Z6r4KnMMDdPGjjMyCk2&_nc_ohc=bkVcQq2ogcoQ7kNvwH1WfZ0&_nc_oc=AdnzMwrnocAGruHU8FK5u-7OPp7B_zB90eq4PLbI2Js0s4nLJkv3D56b6fJx69DuMsBCYxfQVqb72V878dPbq4Iy&_nc_zt=23&_nc_ht=scontent.fcmb12-1.fna&_nc_gid=AFDv7lAY8-h106GA7KAZBA&oh=00_AftqU-97mKxffODZJUyKGlcirlLKN3sohsvVC6pOwXKXZg&oe=698BCD39"
                  ].map((url, i) => (
                    <div 
                      key={i} 
                      className="break-inside-avoid overflow-hidden bg-gray-200"
                    >
                      <img src={url} className="w-full" alt="Collection" />
                    </div>
                  ))}
                </div>
              </div>
            </section>

      {/* --- CALL TO ACTION --- */}
      <section className="py-32 bg-[#666b49] text-center px-5">
        <motion.div 
          initial={{ opacity: 0 }} 
          whileInView={{ opacity: 1 }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-5xl md:text-7xl font-cormorant text-white mb-8">Elevate Your Presence.</h2>
          <p className="text-gray-300 mb-12 text-sm md:text-base font-light tracking-wide uppercase">
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