'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { MapPin, CreditCard, Loader2, Plus, Mail, AlertCircle } from 'lucide-react';

import { useCart } from '@/app/hooks/useCart';
import useUser from '@/app/hooks/useUser';
import axiosInstance from '@/app/utils/axiosInstance';
import { useQueryClient } from '@tanstack/react-query';

// --- 1. Zod Schema ---
const checkoutSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  firstname: z.string().min(2, "First name is required"),
  lastname: z.string().min(2, "Last name is required"),
  addressLine: z.string().min(5, "Address is required"),
  apartment: z.string().optional(),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().min(3, "Postal code is required"),
  phoneNumber: z.string().min(9, "Phone number is required"),
  saveAddress: z.boolean().default(false).optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

// --- Style Constants ---
const inputFieldClass =
  "w-full px-4 py-3.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all shadow-sm";
const inputErrorClass =
  "w-full px-4 py-3.5 bg-white border border-red-500 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-100 outline-none transition-all shadow-sm";
const errorTextClass =
  "text-red-500 text-[11px] font-bold mt-1.5 flex items-center gap-1.5 animate-in slide-in-from-left-1";

export default function CheckoutPage() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const { items } = useCart();
  const { user, isLoading: isUserLoading } = useUser({ required: false });

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = useMemo(() => {
    if (!items) return 0;
    return items.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 0;
      return sum + price * qty;
    }, 0);
  }, [items]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { saveAddress: true },
  });

  // ✅ Only redirect away when you are on "/checkout" page AND cart is empty
  useEffect(() => {
    if (pathname !== '/checkout') return; // VERY IMPORTANT

    if (!isProcessing && (!items || items.length === 0)) {
      router.replace('/shop');
    }
  }, [items, router, isProcessing, pathname]);

  useEffect(() => {
    if (user && user.addresses?.length > 0 && !selectedAddressId) {
      const defaultAddr = user.addresses.find((a: any) => a.isDefault);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      else setSelectedAddressId(user.addresses[0].id);
    }
  }, [user, selectedAddressId]);

  const handleSaveNewAddress = async (data: CheckoutFormValues) => {
    try {
      setIsProcessing(true);
      const payload = {
        firstname: data.firstname,
        lastname: data.lastname,
        addressLine: data.addressLine,
        apartment: data.apartment,
        city: data.city,
        postalCode: data.postalCode,
        phoneNumber: data.phoneNumber,
        isDefault: !!data.saveAddress,
      };

      const res = await axiosInstance.post('/api/auth/add-address', payload);

      if (res.data.success) {
        toast.success("Address saved successfully");
        await queryClient.invalidateQueries({ queryKey: ['user'] });

        const newAddressList = res.data.addresses;
        if (Array.isArray(newAddressList) && newAddressList.length > 0) {
          const newAddr = newAddressList[newAddressList.length - 1];
          setSelectedAddressId(newAddr.id);
        }

        setIsAddingNewAddress(false);
        reset();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save address");
    } finally {
      setIsProcessing(false);
    }
  };

  const onPlaceOrder = async (data: CheckoutFormValues) => {
    setIsProcessing(true);

    try {
      let orderPayload;

      if (user) {
        if (isAddingNewAddress) {
          await handleSaveNewAddress(data);
          return;
        }
        if (!selectedAddressId) {
          toast.error("Please select a shipping address");
          return;
        }

        orderPayload = {
          type: 'USER',
          userId: user.id,
          addressId: selectedAddressId,
          items: items.map(item => ({
            productId: item.productId,
            sku: item.sku,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
          })),
          email: user.email,
          paymentMethod: 'COD',
        };
      } else {
        if (!data.email) {
          toast.error("Email is required for guests");
          return;
        }

        orderPayload = {
          type: 'GUEST',
          email: data.email,
          address: {
            firstname: data.firstname,
            lastname: data.lastname,
            addressLine: data.addressLine,
            apartment: data.apartment,
            city: data.city,
            postalCode: data.postalCode,
            phoneNumber: data.phoneNumber,
          },
          items: items.map(item => ({
            productId: item.productId,
            sku: item.sku,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
          })),
          paymentMethod: 'COD',
        };
      }

      const res = await axiosInstance.post('/api/orders', orderPayload);

      if (res.data.success) {
        toast.success("Order placed successfully!");

        // ✅ Navigate FIRST. Do NOT clear cart here.
        router.replace(`/checkout/success?orderNumber=${res.data.orderId}&success=true`);
      }
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Failed to place order";
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4 md:px-8 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* === LEFT COLUMN: Forms === */}
        <div className="lg:col-span-7 space-y-6">

          {/* 1. Contact Info (Guest Only) */}
          {!user && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Mail size={18} /> Contact Information
                </h2>
                <Link href="/login" className="text-sm text-blue-600 hover:underline">
                  Already have an account? Sign in
                </Link>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase text-gray-500 mb-2">Email Address</label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="you@example.com"
                  className={errors.email ? inputErrorClass : inputFieldClass}
                />
                {errors.email && (
                  <p className={errorTextClass}>
                    <AlertCircle size={12} /> {errors.email.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 2. Shipping Address */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
              <MapPin size={18} /> Shipping Address
            </h2>

            {/* --- USER: Saved Addresses List --- */}
            {user && !isAddingNewAddress && (
              <div className="flex flex-col gap-4 mb-6">
                {user.addresses && user.addresses.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {user.addresses.map((addr: any) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`cursor-pointer border-2 rounded-lg p-4 transition-all flex items-start gap-3
                        ${selectedAddressId === addr.id ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-300'}
                        `}
                      >
                        <div className={`mt-1 w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center
                        ${selectedAddressId === addr.id ? 'border-black' : ''}`}>
                          {selectedAddressId === addr.id && <div className="w-2 h-2 rounded-full bg-black" />}
                        </div>
                        <div className="text-sm flex-1 min-w-0">
                          <p className="font-bold text-gray-900 break-words">{addr.firstname} {addr.lastname}</p>
                          <p className="text-gray-600 break-words">{addr.addressLine}{addr.apartment ? `, ${addr.apartment}` : ''}</p>
                          <p className="text-gray-600 break-words">{addr.city}, {addr.postalCode}</p>
                          <p className="text-gray-500 text-xs mt-1 break-words">{addr.phoneNumber}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm italic">No saved addresses found.</p>
                )}

                <button
                  type="button"
                  onClick={() => setIsAddingNewAddress(true)}
                  className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition self-start"
                >
                  <Plus size={16} /> Add New Address
                </button>
              </div>
            )}

            {/* --- USER/GUEST: Address Form (FLEX LAYOUT) --- */}
            {(!user || isAddingNewAddress || (user && user.addresses.length === 0)) && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                {user && (
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                      New Address Details
                    </h3>
                    {user.addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsAddingNewAddress(false)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                )}

                {/* Main Flex Container */}
                <div className="flex flex-col gap-6">
                  
                  {/* Row 1: First Name & Last Name */}
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">First Name</label>
                      <input 
                        {...register("firstname")} 
                        className={errors.firstname ? inputErrorClass : inputFieldClass}
                        placeholder="e.g. John" 
                      />
                      {errors.firstname && <p className={errorTextClass}><AlertCircle size={12} /> {errors.firstname.message}</p>}
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Last Name</label>
                      <input 
                        {...register("lastname")} 
                        className={errors.lastname ? inputErrorClass : inputFieldClass}
                        placeholder="e.g. Doe"
                      />
                      {errors.lastname && <p className={errorTextClass}><AlertCircle size={12} /> {errors.lastname.message}</p>}
                    </div>
                  </div>

                  {/* Row 2: Address */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Address</label>
                    <input 
                      {...register("addressLine")} 
                      className={errors.addressLine ? inputErrorClass : inputFieldClass}
                      placeholder="e.g. 123 Main Street"
                    />
                    {errors.addressLine && <p className={errorTextClass}><AlertCircle size={12} /> {errors.addressLine.message}</p>}
                  </div>

                  {/* Row 3: Apartment */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Apartment (Optional)</label>
                    <input 
                      {...register("apartment")} 
                      className={inputFieldClass} 
                      placeholder="e.g. Apt 4B"
                    />
                  </div>

                  {/* Row 4: City & Postal Code */}
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">City</label>
                      <input 
                        {...register("city")} 
                        className={errors.city ? inputErrorClass : inputFieldClass}
                        placeholder="e.g. Colombo"
                      />
                      {errors.city && <p className={errorTextClass}><AlertCircle size={12} /> {errors.city.message}</p>}
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Postal Code</label>
                      <input 
                        {...register("postalCode")} 
                        className={errors.postalCode ? inputErrorClass : inputFieldClass}
                        placeholder="e.g. 10100"
                      />
                      {errors.postalCode && <p className={errorTextClass}><AlertCircle size={12} /> {errors.postalCode.message}</p>}
                    </div>
                  </div>

                  {/* Row 5: Phone Number */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Phone Number</label>
                    <input 
                      {...register("phoneNumber")} 
                      className={errors.phoneNumber ? inputErrorClass : inputFieldClass}
                      placeholder="e.g. +94 77 123 4567"
                    />
                    {errors.phoneNumber && <p className={errorTextClass}><AlertCircle size={12} /> {errors.phoneNumber.message}</p>}
                  </div>

                  {/* Save Checkbox for User */}
                  {user && (
                    <div className="pt-2">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          {...register("saveAddress")}
                          className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black transition-all cursor-pointer"
                        />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-black transition-colors">
                          Save this address for future use
                        </span>
                      </label>
                    </div>
                  )}

                  {/* Save Button for User Mode */}
                  {user && isAddingNewAddress && (
                    <button
                      type="button"
                      onClick={handleSubmit(handleSaveNewAddress)}
                      disabled={isProcessing}
                      className="mt-4 w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-sm tracking-wide uppercase hover:bg-black hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      {isProcessing ? <Loader2 className="animate-spin" size={16} /> : "Save & Use Address"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 3. Payment Method */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <CreditCard size={18} /> Payment Method
            </h2>
            <div className="border-2 border-black bg-gray-50 rounded-lg p-4 flex items-center gap-4">
              <div className="w-5 h-5 rounded-full border-[6px] border-black bg-white" />
              <div>
                <p className="font-bold text-gray-900">Cash on Delivery (COD)</p>
                <p className="text-xs text-gray-500">Pay in cash upon delivery of your order.</p>
              </div>
            </div>
          </div>
        </div>

        {/* === RIGHT COLUMN: Order Summary === */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-4">
            <h2 className="text-lg font-bold mb-6">Order Summary</h2>

            <div className="max-h-[300px] overflow-y-auto space-y-4 mb-6 pr-2">
              {/* ... inside items.map loop ... */}
                {items.map((item) => {
                const lineTotal = (Number(item.price) || 0) * (Number(item.quantity) || 0);
                const hasDiscount = item.originalPrice != null && item.originalPrice > item.price;

                return (
                    <div key={item.sku} className="flex gap-4">
                    <div className="w-16 h-20 bg-gray-100 rounded-md overflow-hidden shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold line-clamp-2">{item.name}</p>
                        
                        {/* ✅ UNIT PRICE DISPLAY */}
                        <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-medium text-gray-700">
                            LKR {item.price.toLocaleString()} each
                        </span>
                        {hasDiscount && (
                            <span className="text-[10px] text-gray-400 line-through">
                            LKR {item.originalPrice!.toLocaleString()}
                            </span>
                        )}
                        </div>

                        <p className="text-xs text-gray-500 mt-1">
                        {item.size ? `Size: ${item.size}` : ''} {item.color ? `• Color: ${item.color}` : ''}
                        </p>
                        
                        <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        <div className="text-right">
                            <p className="text-sm font-bold">LKR {lineTotal.toLocaleString()}</p>
                            {hasDiscount && (
                            <p className="text-[10px] text-green-600 font-medium">
                                Saved LKR {((item.originalPrice! - item.price) * item.quantity).toLocaleString()}
                            </p>
                            )}
                        </div>
                        </div>
                    </div>
                    </div>
                );
                })}
            </div>

            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>LKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>Calculated next</span>
              </div>
              <div className="flex justify-between text-xl font-black mt-4 pt-4 border-t">
                <span>Total</span>
                <span>LKR {subtotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                if (user && !isAddingNewAddress) {
                  e.preventDefault();
                  onPlaceOrder({} as CheckoutFormValues);
                } else {
                  handleSubmit(onPlaceOrder)(e);
                }
              }}
              disabled={isProcessing || (user && isAddingNewAddress)}
              className="w-full mt-8 bg-black text-white py-4 rounded-lg font-bold text-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? <Loader2 className="animate-spin" /> : "PLACE ORDER"}
            </button>

            <p className="text-[10px] text-gray-400 text-center mt-4">
              By placing this order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}