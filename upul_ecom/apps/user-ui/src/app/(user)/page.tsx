'use client'
import React from 'react'
// Import Swiper React components and styles
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/pagination'

const Page = () => {
  // Array for your banners
  const banners = [
    {
      desktop: "https://digitalassets.gapinc.com/AssetLink/6fpo170lcbq5npxy4w8h2h1ulkvnn25r.auto",
      mobile: "https://digitalassets.gapinc.com/AssetLink/6fpo170lcbq5npxy4w8h2h1ulkvnn25r.auto",
      alt: "Summer Collection"
    },
    {
      desktop: "https://digitalassets.gapinc.com/AssetLink/35s846unk7tvy48w06l8k220218p6np3.auto", // Replace with second desktop img
      mobile: "https://digitalassets.gapinc.com/AssetLink/35s846unk7tvy48w06l8k220218p6np3.auto", // Replace with second mobile img
      alt: "New Arrivals"
    }
  ]

  return (
    <>
      <div className="w-full h-[calc(100vh-140px)] md:h-[calc(100vh-160px)]">
        <Swiper
          spaceBetween={0}
          centeredSlides={true}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          modules={[Autoplay, Pagination]}
          className="h-full w-full"
        >
          {banners.map((banner, index) => (
            <SwiperSlide key={index}>
              <div className="relative w-full h-full">
                {/* Desktop Image */}
                <img
                  src={banner.desktop}
                  alt={banner.alt}
                  className="hidden md:block w-full h-full object-cover"
                />
                {/* Mobile Image */}
                <img
                  src={banner.mobile}
                  alt={banner.alt}
                  className="block md:hidden w-full h-full object-cover"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className='bg-red-500 p-4 text-white'>
        hello
      </div>
    </>
  )
}

export default Page