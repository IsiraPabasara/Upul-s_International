"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query"; // 👈 TanStack Power
import { useRouter } from "next/navigation";
import axiosInstance from "@/app/utils/axiosInstance";
import ProductForm from "../components/ProductForm"; // 👈 Reuse the brain
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AddProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // THE MUTATION (Create Mode)
  const createMutation = useMutation({
    mutationFn: async (formData: any) => {
      // POST request to create new
      return axiosInstance.post('/api/products', formData);
    },
    onSuccess: () => {
      toast.success("Product created successfully! 🚀");
      // Refresh the list so the new item appears
      queryClient.invalidateQueries({ queryKey: ["products"] });
      router.push("/dashboard/products");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error || "Failed to create product";
      toast.error(msg);
    }
  });

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10">
      <div className="mb-8">
        <Link href="/dashboard/products" className="text-sm text-gray-500 hover:text-black flex items-center gap-2 mb-2 transition-colors">
          <ArrowLeft size={16} /> Back to Products
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Add New Product
        </h1>
        <p className="text-gray-500 mt-1">Create a new item for your store.</p>
      </div>

      {/* The Reusable Form (No initialData = Create Mode) */}
      <ProductForm 
        onSubmit={async (data) => {
          await createMutation.mutateAsync(data);
        }}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}