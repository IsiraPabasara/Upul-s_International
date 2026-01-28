"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { ChevronLeft } from "lucide-react";
import useUser from "@/app/hooks/useUser";
import axiosInstance from "@/app/utils/axiosInstance";
import { useQueryClient } from "@tanstack/react-query";
import { useCart } from "@/app/hooks/useCart";
import toast from "react-hot-toast";
import { useWishlist } from "@/app/hooks/useWishlist";

const ProfilePage = () => {
  const { user, isLoading } = useUser();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await axiosInstance.get('/api/auth/logout-user');
      queryClient.clear();
      
      // Clear Zustand cart state and localStorage
      useCart.getState().clearCart();
      useWishlist.getState().clearWishlist();
      useWishlist.persist.clearStorage();
      localStorage.removeItem('eshop-cart-storage');
      localStorage.removeItem('eshop-wishlist-storage');
      toast.success("Logged out successfully");
      router.push('/login');
    } catch (error) {
      toast.error("Logout failed");
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  if (isLoading) return <div className="p-20 text-center uppercase tracking-[0.3em] text-[10px] text-gray-400">Loading Account...</div>;

  const defaultAddress = user?.addresses?.find((addr: any) => addr.isDefault) || user?.addresses?.[0];

  return (
    <div className="w-full min-h-screen bg-white font-sans pb-20 relative">
      
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isLoggingOut && setShowLogoutConfirm(false)} />
          <div className="relative bg-white border border-gray-100 p-12 max-w-[420px] w-full shadow-sm text-center">
            <h3 className="text-[13px] tracking-[0.3em] uppercase font-bold mb-4 text-gray-800">Confirm Logout</h3>
            <p className="text-[12px] text-gray-400 mb-10 font-light leading-relaxed">Are you sure you want to log out of your account?</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleLogout} disabled={isLoggingOut}
                className="relative w-full py-4 text-[10px] tracking-[0.3em] uppercase font-bold text-white border border-black overflow-hidden group bg-black hover:text-black transition-colors duration-500">
                <span className="absolute inset-0 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
                <span className="relative z-10">{isLoggingOut ? "Logging out..." : "Logout"}</span>
              </button>
              <button onClick={() => setShowLogoutConfirm(false)} disabled={isLoggingOut}
                className="w-full py-3 text-[10px] tracking-[0.2em] uppercase font-bold text-gray-500 hover:text-black transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`max-w-[1200px] mx-auto px-6 md:px-12 pt-12 transition-opacity duration-500 ${showLogoutConfirm ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
        
        {/* Navigation */}
        <div className="flex mb-8">
          <button onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-1 text-[13px] tracking-[0.2em] uppercase text-gray-700 hover:text-black transition-colors">
            <ChevronLeft size={12} /> Logout
          </button>
        </div>

        <h1 className="text-[22px] tracking-[0.4em] uppercase mb-10 text-gray-800 font-light">
          Your Account
        </h1>

        <div className="flex flex-col lg:flex-row gap-20 lg:gap-32">
          
          {/* Left Side */}
          <div className="flex flex-col flex-1 gap-20">
            
            {/* Profile */}
            <section className="flex flex-col">
              <div className="flex justify-between items-end border-b border-gray-400 pb-3 mb-8">
                <h2 className="text-[15px] font-bold tracking-tight text-gray-800">Profile</h2>
                <Link href="/profile/user" className="text-[10px] tracking-widest text-gray-600 uppercase hover:text-black transition-colors">Edit</Link>
              </div>
              <div className="flex flex-col gap-2 text-[13px] text-gray-500">
                <p><span className="font-bold text-gray-800 mr-2">First Name:</span> {user?.firstname}</p>
                <p><span className="font-bold text-gray-800 mr-2">Last Name:</span> {user?.lastname}</p>
                <p><span className="font-bold text-gray-800 mr-2">E-mail:</span> {user?.email}</p>
                <p><span className="font-bold text-gray-800 mr-2">Phone Number:</span> <span className="">{user?.phonenumber}</span></p>
              </div>
            </section>

            {/* Addresses */}
            <section className="flex flex-col">
              <div className="flex justify-between items-end border-b border-gray-400 pb-3 mb-8">
                <h2 className="text-[15px] font-bold tracking-tight text-gray-800">Addresses</h2>
                <Link href="/profile/address" className="text-[10px] tracking-widest text-gray-600 uppercase hover:text-black transition-colors">View All</Link>
              </div>
              
              {defaultAddress ? (
                <div className="flex flex-col border border-gray-500 p-8 rounded-sm w-full max-w-[380px]">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500 mb-6 font-bold">Default Address</p>
                  <div className="flex flex-col text-[13px] text-gray-500 space-y-1">
                    <p className="font-bold text-gray-800 mb-2 text-[14px]">{defaultAddress.firstname} {defaultAddress.lastname}</p>
                    <p>{defaultAddress.addressLine}</p>
                    <p>{defaultAddress.postalCode} {defaultAddress.city}</p>
                    <p className="text-gray-400">United States</p>
                    <p className="pt-4 text-gray-800 font-medium tracking-wide">{defaultAddress.phoneNumber}</p>
                  </div>
                </div>
              ) : (
                <p className="text-[13px] text-gray-400 italic font-light">No addresses saved yet.</p>
              )}
            </section>
          </div>

          {/* Right Side */}
          <div className="flex flex-col w-full lg:w-[420px]">
            <section className="flex flex-col">
              <div className="flex justify-between items-end border-b border-gray-400 pb-3 mb-8">
                <h2 className="text-[15px] font-bold tracking-tight text-gray-800">Order History</h2>
                <Link href="/profile/orders" className="text-[10px] tracking-widest text-gray-600 uppercase hover:text-black transition-colors">View All</Link>
              </div>
              
              <div className="flex flex-col gap-8">
                <p className="text-[10px] uppercase tracking-[0.25em] text-gray-300 font-bold">Orders</p>
                <p className="text-[13px] text-gray-400 font-light leading-relaxed">You haven't placed any orders yet.</p>
                
                <div className="flex pt-4">
                  <button className="relative px-12 py-4 text-[10px] tracking-[0.3em] uppercase font-bold text-white border border-black overflow-hidden group bg-black hover:text-black transition-colors duration-500">
                    <span className="absolute inset-0 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
                    <span className="relative z-10">Continue Shopping</span>
                  </button>
                </div>
              </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;