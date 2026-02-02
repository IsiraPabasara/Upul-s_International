import React from 'react';

const BrandMarquee = () => {
  const brands = [
    { name: "Polo", logo: "https://ik.imagekit.io/aqi4rj9dnl/polo-resized?updatedAt=1769868189791", scale: "scale-100" },
    { name: "Crocodile", logo: "https://ik.imagekit.io/aqi4rj9dnl/26259486105.png", scale: "scale-100" },
    // { name: "Emerald", logo: "/logos/emerald.png", scale: "scale-90" }, 
    // { name: "Majestic", logo: "/logos/majestic.png", scale: "scale-125" },
    { name: "Signature", logo: "https://ik.imagekit.io/aqi4rj9dnl/image.png", scale: "scale-100" },
    { name: "Puma", logo: "https://ik.imagekit.io/aqi4rj9dnl/image%20(1).png", scale: "scale-90" },
    { name: "Lacoste", logo: "https://ik.imagekit.io/aqi4rj9dnl/image%20(2).png", scale: "scale-90" },
    { name: "Adidas", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/1200px-Adidas_Logo.svg.png", scale: "scale-90" },
  ];

  const displayBrands = [...brands, ...brands];

  return (
    <div className="relative w-full overflow-hidden bg-white py-7 border-y border-gray-300">
      {/* Edge Fades */}
      <div className="absolute inset-y-0 left-0 w-24 md:w-40 bg-gradient-to-r from-white to-transparent z-10"></div>
      <div className="absolute inset-y-0 right-0 w-24 md:w-40 bg-gradient-to-l from-white to-transparent z-10"></div>

      <div className="flex w-max animate-marquee items-center gap-12 md:gap-24">
        {displayBrands.map((brand, index) => (
          <div 
            key={index} 
            className={`flex items-center justify-center 
              /* This container acts as the 'frame' */
              w-[120px] h-[60px] md:w-[180px] md:h-[80px] 
              ${brand.scale} transition-all duration-500`}
          >
            <img
              src={brand.logo}
              alt={brand.name}
              className="max-w-full max-h-full object-contain opacity-1 grayscale hover:grayscale-0 hover:opacity-100"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.querySelector('.fallback')?.classList.remove('hidden');
              }}
            />
            <span className="fallback hidden font-bold text-gray-400 uppercase text-sm">
              {brand.name}
            </span>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default BrandMarquee;