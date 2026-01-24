'use client';

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, Trash2, CheckCircle, Pencil, X, ChevronLeft } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import useUser from "@/app/hooks/useUser";
import axiosInstance from "@/app/utils/axiosInstance";

type AddressFormData = {
  firstname: string;
  lastname: string;
  addressLine: string;
  apartment?: string;
  city: string;
  postalCode: string;
  phoneNumber: string;
  isDefault: boolean;
};

const AddressManager = () => {
  const { user, isLoading } = useUser();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<AddressFormData>({
    defaultValues: { isDefault: false }
  });

  const isDefaultChecked = watch("isDefault");

  // Helper to refresh user data
  const invalidateUser = () => queryClient.invalidateQueries({ queryKey: ["user"] });

  // --- Mutations ---
  const addMutation = useMutation({
    mutationFn: (data: AddressFormData) => axiosInstance.post("/api/auth/add-address", data),
    onSuccess: () => {
      invalidateUser();
      reset();
      setIsEditing(false);
      toast.success("Address added successfully");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to add address"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: AddressFormData) => axiosInstance.put(`/api/auth/update-address/${selectedAddressId}`, data),
    onSuccess: () => {
      invalidateUser();
      setIsEditing(false);
      setSelectedAddressId(null);
      toast.success("Address updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axiosInstance.delete(`/api/auth/delete-address/${id}`),
    onSuccess: () => {
      invalidateUser();
      toast.success("Address removed");
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => axiosInstance.patch(`/api/auth/set-default-address/${id}`),
    onSuccess: invalidateUser,
  });

  const onSubmit = (data: AddressFormData) => {
    if (selectedAddressId) {
      updateMutation.mutate(data);
    } else {
      addMutation.mutate(data);
    }
  };

  const handleEditClick = (address: any) => {
    setSelectedAddressId(address.id);
    setIsEditing(true);
    Object.keys(address).forEach((key) => {
      setValue(key as keyof AddressFormData, address[key]);
    });
  };

  if (isLoading) return <div className="p-20 text-center uppercase tracking-[0.3em] text-[10px] text-black">Loading...</div>;

  return (
    <div className="w-full min-h-screen bg-white font-sans pb-20">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 pt-12">
        
        {/* Navigation */}
        <div className="flex mb-12">
          <Link href="/profile" className="flex items-center gap-1 text-[10px] tracking-[0.2em] uppercase text-black  hover:text-black/50 transition-colors">
            <ChevronLeft size={12} /> Back to Account
          </Link>
        </div>

        <div className="flex justify-between items-center mb-16 border-b-2 border-black pb-6">
          <h1 className="text-[17px] md:text-[20px] tracking-[0.3em] md:tracking-[0.4em] uppercase text-black ">
            Addresses
          </h1>
          {!isEditing && (
            <button
            onClick={() => { setIsEditing(true); setSelectedAddressId(null); reset(); }}
            className="relative px-2.5 md:px-8 py-3 text-[10px] tracking-[0.2em] uppercase font-bold text-white border-2 border-black overflow-hidden group bg-black hover:text-black transition-colors duration-500"
            >
            <span className="absolute -inset-[2px] bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
            
            <span className="relative z-10 flex items-center justify-center gap-2">
                <Plus size={14} /> Add New
            </span>
            </button>
          )}
        </div>

        {isEditing ? (
          /* --- Add/Edit Form --- */
          <div className="max-w-[600px]">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="text-[10px] uppercase tracking-widest  mb-2">First Name</label>
                  <input {...register("firstname", { required: "Required" })} placeholder="First Name" className="p-4 border border-black outline-none focus:border-black text-sm font-medium" />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] uppercase tracking-widest nt mb-2">Last Name</label>
                  <input {...register("lastname", { required: "Required" })} placeholder="Last Name" className="p-4 border border-black outline-none focus:border-black text-sm font-medium" />
                </div>
                <div className="md:col-span-2 flex flex-col">
                  <label className="text-[10px] uppercase tracking-widest  mb-2">Address Line</label>
                  <input {...register("addressLine", { required: "Required" })} placeholder="Street address" className="p-4 border border-black outline-none focus:border-black text-sm font-medium" />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] uppercase tracking-widest  mb-2">City</label>
                  <input {...register("city", { required: "Required" })} placeholder="City" className="p-4 border border-black outline-none focus:border-black text-sm font-medium" />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] uppercase tracking-widest  mb-2">Postal Code</label>
                  <input {...register("postalCode", { required: "Required" })} placeholder="Postal Code" className="p-4 border border-black outline-none focus:border-black text-sm font-medium" />
                </div>
                <div className="md:col-span-2 flex flex-col">
                  <label className="text-[10px] uppercase tracking-widest  mb-2">Phone Number</label>
                  <input {...register("phoneNumber", { required: "Required", pattern: /^\d+$/ })} placeholder="Phone Number" className="p-4 border border-black outline-none focus:border-black text-sm font-medium" />
                </div>
              </div>

              {/* Default Checkbox */}
              <label className="flex items-center cursor-pointer select-none group w-fit">
                <input type='checkbox' className='sr-only' {...register("isDefault")} />
                <div className={`w-5 h-5 border-2 border-black transition-all flex items-center justify-center ${isDefaultChecked ? 'bg-black' : 'bg-white'}`}>
                  {isDefaultChecked && <div className="w-2 h-2 bg-white" />}
                </div>
                <span className='ml-3 text-[11px] text-black  uppercase tracking-widest'>Set as default address</span>
              </label>

              <div className="flex gap-4 pt-6">
                <button type="submit" disabled={addMutation.isPending || updateMutation.isPending}
                  className="relative flex-1 py-4 text-xs tracking-[0.3em] uppercase  text-white border-2 border-black overflow-hidden group bg-black hover:text-black transition-colors duration-500">
                  <span className="absolute inset-0 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
                  <span className="relative z-10">{selectedAddressId ? "Update" : "Save"}</span>
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-4 text-xs tracking-[0.3em] uppercase  text-black border-2 border-black hover:bg-black hover:text-white transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* --- Address List --- */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {user?.addresses?.map((addr: any) => (
              <div key={addr.id} className={`flex flex-col border-2 p-8 transition-all ${addr.isDefault ? "border-black bg-white" : "border-black/10 bg-white hover:border-black"}`}>
                <div className="flex justify-between items-start mb-6">
                   <div className="p-2 bg-black text-white"><MapPin size={16} /></div>
                   {addr.isDefault && (
                    <span className="text-[10px]  uppercase tracking-widest border-b-2 border-black pb-0.5">Default</span>
                   )}
                </div>
                
                <div className="flex flex-col flex-1 text-black min-w-0"> {/* min-w-0 is crucial for flex child wrapping */}
                <p className=" text-[16px] uppercase tracking-tight mb-2 break-words">
                {addr.firstname} {addr.lastname}
                </p>
                
                {/* The addressLine now wraps automatically */}
                <p className="text-[14px] font-medium leading-relaxed break-words whitespace-pre-wrap">
                {addr.addressLine}
                </p>
                
                <p className="text-[14px] font-medium leading-relaxed break-words">
                {addr.city}, {addr.postalCode}
                </p>
                

                <p className="text-[15px]  mt-4 tabular-nums">{addr.phoneNumber}</p>
            </div>

                <div className="flex gap-6 mt-10 pt-6 border-t border-black/10">
                  <button onClick={() => handleEditClick(addr)} className="text-[10px]  uppercase tracking-widest flex items-center gap-1.5 hover:text-black/50">
                    <Pencil size={12} /> Edit
                  </button>
                  <button onClick={() => deleteMutation.mutate(addr.id)} className="text-[10px]  uppercase tracking-widest flex items-center gap-1.5 text-red-600 hover:text-red-400">
                    <Trash2 size={12} /> Delete
                  </button>
                  {!addr.isDefault && (
                    <button onClick={() => setDefaultMutation.mutate(addr.id)} className="text-[10px] ml-auto  uppercase tracking-widest underline underline-offset-4 hover:text-black/50">
                      Set Default
                    </button>
                  )}
                </div>
              </div>
            ))}

            {user?.addresses?.length === 0 && (
              <div className="md:col-span-2 lg:col-span-3 py-32 text-center border-2 border-dashed border-black/20">
                <p className="text-black  uppercase tracking-[0.3em] text-[12px]">No addresses found.</p>
                <button 
                  onClick={() => { setIsEditing(true); setSelectedAddressId(null); reset(); }}
                  className="mt-6 text-[10px]  uppercase tracking-widest border-b-2 border-black hover:text-black/50 transition-colors"
                >
                  Add your first address
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressManager;