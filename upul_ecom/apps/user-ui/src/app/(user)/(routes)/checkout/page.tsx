    'use client';

    import React, { useState, useEffect, useMemo } from 'react';
    import { useForm, SubmitHandler } from 'react-hook-form';
    import { zodResolver } from '@hookform/resolvers/zod';
    import * as z from 'zod';
    import { useRouter } from 'next/navigation';
    import Link from 'next/link';
    import toast from 'react-hot-toast';
    import {
    MapPin,
    CreditCard,
    Loader2,
    Plus,
    Mail
    } from 'lucide-react';

    // Hooks & Utils
    // 👇 FIX 1: Import CartItem type from the hook source so 'productId' is defined
    import { useCart, type CartItem } from '@/app/hooks/useCart';
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

    // ❌ Removed local 'type CartItem' definition to avoid conflicts

    // --- 2. Main Component ---
    export default function CheckoutPage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    // 👇 FIX 2: Destructure directly. The hook returns items, not subtotal.
    const { items, clearCart } = useCart();
    
    const { user, isLoading: isUserLoading } = useUser({ required: false });

    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // 👇 FIX 3: Calculate subtotal here (since it doesn't exist on CartState)
    const subtotal = useMemo(() => {
        if (!items) return 0;
        return items.reduce((sum, item) => {
        const price = Number(item.price) || 0;
        const qty = Number(item.quantity) || 0;
        return sum + price * qty;
        }, 0);
    }, [items]);

    // Form Setup
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CheckoutFormValues>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
        saveAddress: true
        }
    });

    // --- Effects ---

    // Redirect if cart is empty
    useEffect(() => {
        if (!items || items.length === 0) {
        router.push('/shop'); 
        }
    }, [items, router]);

    // Set default address if user exists
    useEffect(() => {
        if (user && user.addresses?.length > 0 && !selectedAddressId) {
        const defaultAddr = user.addresses.find((a: any) => a.isDefault);
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);
        else setSelectedAddressId(user.addresses[0].id);
        }
    }, [user, selectedAddressId]);

    // --- Handlers ---

    // A. Save New Address (For Logged In User)
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
            isDefault: !!data.saveAddress
        };

        const res = await axiosInstance.post('/api/auth/add-address', payload);

        if (res.data.success) {
            toast.success("Address saved successfully");

            // Refetch user to get the new ID
            await queryClient.invalidateQueries({ queryKey: ['user'] });

            // Prefer returned addresses if your API returns them
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

    // B. Place Final Order
    const onPlaceOrder = async (data: CheckoutFormValues) => {
        setIsProcessing(true);
        
        try {
        let orderPayload;

        // 1. Construct Payload based on Auth Status
        if (user) {
            // --- LOGGED IN USER ---
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
            // Map items to clean structure
            // 👇 FIX 4: 'item' now has correct type, so productId is valid
            items: items.map(item => ({ 
                productId: item.productId, 
                sku: item.sku, 
                quantity: item.quantity, 
                size: item.size,
                color: item.color
            })),
            email: user.email, 
            paymentMethod: 'COD'
            };
        } 
        else {
            // --- GUEST USER ---
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
            items: items.map(item => ({ 
                productId: item.productId, 
                sku: item.sku, 
                quantity: item.quantity, 
                size: item.size, 
                color: item.color
            })),
            paymentMethod: 'COD'
            };
        }

        // 2. Call the API
        const res = await axiosInstance.post('/api/orders', orderPayload);
        
        if (res.data.success) {
            toast.success("Order placed successfully!");
            clearCart(); 
            
            // 3. Redirect to Success Page
            router.push(`/checkout/success?orderNumber=${res.data.orderId}`);
        }

        } catch (error: any) {
        console.error(error);
        const msg = error.response?.data?.message || "Failed to place order";
        toast.error(msg);
        } finally {
        setIsProcessing(false);
        }
    };

    const onMainFormSubmit: SubmitHandler<CheckoutFormValues> = (data) => {
        if (user && isAddingNewAddress) {
        handleSaveNewAddress(data);
        } else {
        onPlaceOrder(data);
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
                <div className="space-y-4">
                    <div>
                    <label className="text-xs font-bold uppercase text-gray-500">Email Address</label>
                    <input
                        {...register("email")}
                        type="email"
                        placeholder="you@example.com"
                        className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-black outline-none transition"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>
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

                {/* --- USER/GUEST: Address Form --- */}
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

                    {/* Save Checkbox for User */}
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

                    {/* Save Button specifically for User Mode */}
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
  type="button" // Change to button to prevent default form submission quirks
  onClick={(e) => {
    // 1. If User is Logged In AND using a Saved Address -> SKIP FORM VALIDATION
    if (user && !isAddingNewAddress) {
      e.preventDefault();
      // Pass empty object casted as values, logic uses selectedAddressId anyway
      onPlaceOrder({} as CheckoutFormValues); 
    } 
    // 2. Else (Guest or Adding New Address) -> RUN VALIDATION
    else {
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

        {/* Tailwind Utility for Inputs */}
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