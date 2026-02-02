"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import axiosInstance from "@/app/utils/axiosInstance";
import ProductForm, { ProductFormValues } from "../../components/ProductForm";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function EditProductPage() {
  const { sku } = useParams();
  const queryClient = useQueryClient();

  // 1. FETCH
  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", sku],
    queryFn: async () => {
      const res = await axiosInstance.get(`/api/products/${sku}`);
      return res.data;
    },
    enabled: !!sku,
  });

  // 2. UPDATE
  const updateMutation = useMutation({
    mutationFn: async (formData: ProductFormValues) => {
      return axiosInstance.put(`/api/products/${sku}`, formData);
    },
    onSuccess: () => {
      toast.success("Product updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", sku] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to update");
    },
  });

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;
  if (isError || !product) return <div className="text-center p-20 text-red-500">Product Not Found</div>;

  return (
    <div className="max-w-5xl mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Link href="/dashboard/products" className="text-sm text-gray-500 hover:text-black flex items-center gap-2 mb-2">
          <ArrowLeft size={16} /> Back to Products
        </Link>
        <h1 className="text-2xl font-bold">Edit Product: <span className="text-gray-500">{product.name}</span></h1>
      </div>

      <ProductForm
        initialData={product}
        onSubmit={async (data) => updateMutation.mutate(data)}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
}