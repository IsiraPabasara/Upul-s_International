'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { MapPin, CreditCard, Loader2, Plus, Mail, Banknote } from 'lucide-react';

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

// --- 2. Main Component ---
export default function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { items, clearCart } = useCart();
  const { user, isLoading: isUserLoading } = useUser({ required: false });

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // 👇 Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'PAYHERE'>('COD');

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

  // Redirect if cart is empty
  useEffect(() => {
    if (!items || items.length === 0) router.push('/shop');
  }, [items, router]);

  // Set default address if user exists
  useEffect(() => {
    if (user && user.addresses?.length > 0 && !selectedAddressId) {
      const defaultAddr = user.addresses.find((a: any) => a.isDefault);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      else setSelectedAddressId(user.addresses[0].id);
    }
  }, [user, selectedAddressId]);

  // A. Save New Address
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

  // B. Place Final Order (COD or PayHere)
  const onPlaceOrder = async (data: CheckoutFormValues) => {
    setIsProcessing(true);

    try {
      let orderPayload: any;

      // 1) Construct Payload
      if (user) {
        // LOGGED IN USER
        if (isAddingNewAddress) {
          await handleSaveNewAddress(data);
          return;
        }

        if (!selectedAddressId) {
          toast.error("Please select a shipping address");
          setIsProcessing(false);
          return;
        }

        orderPayload = {
          type: 'USER',
          userId: user.id,
          addressId: selectedAddressId,
          items: items.map((item) => ({
            productId: item.productId,
            sku: item.sku,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
          })),
          email: user.email,
          paymentMethod,
        };
      } else {
        // GUEST USER
        if (!data.email) {
          toast.error("Email is required for guests");
          setIsProcessing(false);
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
          items: items.map((item) => ({
            productId: item.productId,
            sku: item.sku,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
          })),
          paymentMethod,
        };
      }

      // 2) Call the API
      const res = await axiosInstance.post('/api/orders', orderPayload);

      if (res.data.success) {
        // --- SCENARIO A: PAYHERE REDIRECT ---
        if (res.data.isPayHere) {
          const params = res.data.payhereParams;

          const form = document.createElement("form");
          form.setAttribute("method", "POST");

          const payHereUrl =
            process.env.NODE_ENV === 'production'
              ? "https://www.payhere.lk/pay/checkout"
              : "https://sandbox.payhere.lk/pay/checkout";

          form.setAttribute("action", payHereUrl);

          Object.keys(params).forEach((key) => {
            const hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);
            form.appendChild(hiddenField);
          });

          document.body.appendChild(form);

          toast.loading("Redirecting to Secure Payment...");

          setTimeout(() => {
            form.submit();
          }, 1500);

          // ❌ REMOVED: clearCart();
          // Keep cart items in case they cancel payment and come back.
          // Cart can be cleared on /checkout/success instead.
          return;
        }

        // --- SCENARIO B: COD SUCCESS ---
        toast.success("Order placed successfully!");
        clearCart(); // ✅ Keep this for COD
        router.push(`/checkout/success?orderNumber=${res.data.orderId}`);
      }
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Failed to place order";
      toast.error(msg);
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

        {/* === LEFT COLUMN === */}
        <div className="lg:col-span-7 space-y-6">

          {/* Contact Info (Guest Only) */}
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
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500">Email Address</label>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="you@example.com"
                    className="input-field"
                  />
                  {errors.email && <p className="error-text">{errors.email.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Shipping Address */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
              <MapPin size={18} /> Shipping Address
            </h2>

            {/* Saved Addresses */}
            {user && !isAddingNewAddress && (
              <div className="space-y-4 mb-6">
                {user.addresses && user.addresses.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
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
                        <div className="text-sm">
                          <p className="font-bold text-gray-900">{addr.firstname} {addr.lastname}</p>
                          <p className="text-gray-600">{addr.addressLine}{addr.apartment ? `, ${addr.apartment}` : ''}</p>
                          <p className="text-gray-600">{addr.city}, {addr.postalCode}</p>
                          <p className="text-gray-500 text-xs mt-1">{addr.phoneNumber}</p>
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
                  className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition"
                >
                  <Plus size={16} /> Add New Address
                </button>
              </div>
            )}

            {/* Address Form */}
            {(!user || isAddingNewAddress || (user && user.addresses.length === 0)) && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                {user && (
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">New Address Details</h3>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-gray-500">First Name</label>
                    <input {...register("firstname")} className="input-field" placeholder="John" />
                    {errors.firstname && <p className="error-text">{errors.firstname.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-gray-500">Last Name</label>
                    <input {...register("lastname")} className="input-field" placeholder="Doe" />
                    {errors.lastname && <p className="error-text">{errors.lastname.message}</p>}
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold uppercase text-gray-500">Address</label>
                    <input {...register("addressLine")} className="input-field" placeholder="123 Main St" />
                    {errors.addressLine && <p className="error-text">{errors.addressLine.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-gray-500">Apartment (Optional)</label>
                    <input {...register("apartment")} className="input-field" placeholder="Apt 4B" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-gray-500">City</label>
                    <input {...register("city")} className="input-field" placeholder="Colombo" />
                    {errors.city && <p className="error-text">{errors.city.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-gray-500">Postal Code</label>
                    <input {...register("postalCode")} className="input-field" placeholder="10100" />
                    {errors.postalCode && <p className="error-text">{errors.postalCode.message}</p>}
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold uppercase text-gray-500">Phone Number</label>
                    <input {...register("phoneNumber")} className="input-field" placeholder="+94 77 123 4567" />
                    {errors.phoneNumber && <p className="error-text">{errors.phoneNumber.message}</p>}
                  </div>

                  {user && (
                    <div className="md:col-span-2 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          {...register("saveAddress")}
                          className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                        />
                        <span className="text-sm text-gray-700">Save this address for future use</span>
                      </label>
                    </div>
                  )}
                </div>

                {user && isAddingNewAddress && (
                  <button
                    type="button"
                    onClick={handleSubmit(handleSaveNewAddress)}
                    disabled={isProcessing}
                    className="mt-6 w-full bg-gray-900 text-white py-3 rounded-lg font-bold text-sm hover:bg-black transition flex items-center justify-center gap-2"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={16} /> : "Save & Use Address"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <CreditCard size={18} /> Payment Method
            </h2>

            <div className="space-y-3">
              <div
                onClick={() => setPaymentMethod('COD')}
                className={`border-2 rounded-lg p-4 flex items-center gap-4 cursor-pointer transition
                ${paymentMethod === 'COD' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className={`w-5 h-5 rounded-full border-[6px] bg-white
                  ${paymentMethod === 'COD' ? 'border-black' : 'border-gray-300'}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Banknote size={20} className="text-green-600" />
                    <p className="font-bold text-gray-900">Cash on Delivery (COD)</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Pay with cash when the package arrives.</p>
                </div>
              </div>

              <div
                onClick={() => setPaymentMethod('PAYHERE')}
                className={`border-2 rounded-lg p-4 flex items-center gap-4 cursor-pointer transition
                ${paymentMethod === 'PAYHERE' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className={`w-5 h-5 rounded-full border-[6px] bg-white
                  ${paymentMethod === 'PAYHERE' ? 'border-blue-600' : 'border-gray-300'}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CreditCard size={20} className="text-blue-600" />
                    <p className="font-bold text-gray-900">Pay Online (Visa/Master/Amex)</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Secure payment via PayHere.lk gateway.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* === RIGHT COLUMN === */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-4">
            <h2 className="text-lg font-bold mb-6">Order Summary</h2>

            <div className="max-h-[300px] overflow-y-auto space-y-4 mb-6 pr-2">
              {items.map((item) => {
                const lineTotal = (Number(item.price) || 0) * (Number(item.quantity) || 0);
                return (
                  <div key={item.sku} className="flex gap-4">
                    <div className="w-16 h-20 bg-gray-100 rounded-md overflow-hidden shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold line-clamp-2">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.size ? `Size: ${item.size}` : ''} {item.color ? `• Color: ${item.color}` : ''}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-sm font-bold">LKR {lineTotal.toLocaleString()}</p>
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
              className={`w-full mt-8 text-white py-4 rounded-lg font-bold text-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed
                ${paymentMethod === 'PAYHERE' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-black hover:bg-gray-800'}
              `}
            >
              {isProcessing ? <Loader2 className="animate-spin" /> : (paymentMethod === 'PAYHERE' ? "PAY & PLACE ORDER" : "PLACE ORDER")}
            </button>

            <p className="text-[10px] text-gray-400 text-center mt-4">
              By placing this order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>

      </div>

      <style jsx>{`
        .input-field {
          @apply w-full mt-1 p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none transition;
        }
        .error-text {
          @apply text-red-500 text-xs mt-1 font-medium;
        }
      `}</style>
    </div>
  );
}
