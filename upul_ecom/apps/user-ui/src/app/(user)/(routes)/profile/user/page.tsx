"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import useUser from "@/app/hooks/useUser";
import axiosInstance from "@/app/utils/axiosInstance";

type ProfileFormData = {
  firstname: string;
  lastname: string;
  phonenumber: string;
};

const EditProfilePage = () => {
  const { user, isLoading } = useUser();
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>();

  // Pre-fill form when user data is available
  useEffect(() => {
    if (user) {
      setValue("firstname", user.firstname);
      setValue("lastname", user.lastname);
      setValue("phonenumber", user.phonenumber);
    }
  }, [user, setValue]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      // Adjust this endpoint based on your backend route
      const response = await axiosInstance.put("/api/auth/update-profile", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Profile updated successfully");
      router.push("/profile");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  if (isLoading) return <div className="p-20 text-center uppercase tracking-[0.3em] text-[10px] text-black">Loading...</div>;

  return (
    <div className="w-full min-h-screen bg-white font-sans pb-20">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 pt-12">
        
        {/* Navigation */}
        <div className="flex mb-12">
          <Link href="/profile" className="flex items-center gap-1 text-[10px] tracking-[0.2em] uppercase text-black font-black hover:text-black/50 transition-colors">
            <ChevronLeft size={12} /> Back to Account
          </Link>
        </div>

        <div className="flex flex-col mb-16 border-b-2 border-black pb-6">
          <h1 className="text-[22px] tracking-[0.4em] uppercase text-black ">
            Edit Profile
          </h1>
          <p className="text-[12px] text-gray-500 mt-2 uppercase tracking-widest">Update your personal information</p>
        </div>

        <div className="max-w-[500px]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            
            {/* First Name */}
            <div className="flex flex-col">
              <label className="text-[10px] uppercase tracking-[0.2em] font-black mb-3 text-black">
                First Name
              </label>
              <input
                {...register("firstname", { required: "First name is required" })}
                className="w-full p-4 border border-black outline-none focus:ring-1 focus:ring-black text-sm font-medium transition-all"
                placeholder="Enter first name"
              />
              {errors.firstname && <p className="text-red-600 text-[10px] mt-2 uppercase font-bold tracking-tighter">{errors.firstname.message}</p>}
            </div>

            {/* Last Name */}
            <div className="flex flex-col">
              <label className="text-[10px] uppercase tracking-[0.2em] font-black mb-3 text-black">
                Last Name
              </label>
              <input
                {...register("lastname", { required: "Last name is required" })}
                className="w-full p-4 border border-black outline-none focus:ring-1 focus:ring-black text-sm font-medium transition-all"
                placeholder="Enter last name"
              />
              {errors.lastname && <p className="text-red-600 text-[10px] mt-2 uppercase font-bold tracking-tighter">{errors.lastname.message}</p>}
            </div>

            {/* Phone Number */}
            <div className="flex flex-col">
              <label className="text-[10px] uppercase tracking-[0.2em] font-black mb-3 text-black">
                Phone Number
              </label>
              <input
                {...register("phonenumber", { 
                  required: "Phone number is required",
                  pattern: { value: /^\d{10}$/, message: "Please enter a valid 10-digit number" }
                })}
                className="w-full p-4 border border-black outline-none focus:ring-1 focus:ring-black text-sm font-medium transition-all tabular-nums"
                placeholder="0767406952"
              />
              {errors.phonenumber && <p className="text-red-600 text-[10px] mt-2 uppercase font-bold tracking-tighter">{errors.phonenumber.message}</p>}
            </div>

            {/* Note about Email */}
            <p className="text-[11px] text-gray-400 italic">
              Email address cannot be changed. Contact support if you need to update it.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="relative flex-1 py-4 text-xs tracking-[0.3em] uppercase font-black text-white border-2 border-black overflow-hidden group bg-black hover:text-black transition-colors duration-500"
              >
                <span className="absolute inset-0 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
                <span className="relative z-10">
                  {updateProfileMutation.isPending ? "Updating..." : "Save Changes"}
                </span>
              </button>
              
              <Link
                href="/profile"
                className="flex-1 py-4 text-xs tracking-[0.3em] uppercase font-black text-black border-2 border-black text-center hover:bg-black hover:text-white transition-colors"
              >
                Cancel
              </Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;