"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axiosInstance";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PackageX,
} from "lucide-react";
import toast from "react-hot-toast";
import { Trash2, AlertTriangle } from "lucide-react";

// Types matching your API response
interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  visible: boolean; // We use 'visible' now!
  images: { url: string }[];
  category: { name: string };
  variants: { size: string; stock: number }[];
}

interface ApiResponse {
  data: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function ProductListPage() {
  const queryClient = useQueryClient();

  // --- STATE ---
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  // We use a separate state for the actual API query to debounce/delay typing
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce Logic: Wait 500ms after typing stops before searching
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // --- 1. FETCH PRODUCTS ---
  const { data, isLoading, isError } = useQuery<ApiResponse>({
    queryKey: ["products", page, debouncedSearch], // Refetch when page or search changes
    queryFn: async () => {
      const res = await axiosInstance.get("/api/products", {
        params: {
          page,
          limit: 10,
          search: debouncedSearch,
        },
      });
      return res.data;
    },
    placeholderData: (previousData) => previousData, // Keep old data visible while loading new page
  });

  // --- 2. TOGGLE VISIBILITY MUTATION ---
  const toggleMutation = useMutation({
    mutationFn: async ({
      sku,
      currentStatus,
    }: {
      sku: string;
      currentStatus: boolean;
    }) => {
      // Send the OPPOSITE of current status
      const res = await axiosInstance.patch(`/api/products/${sku}/visibility`, {
        visible: !currentStatus,
      });
      return res.data;
    },
    onSuccess: (data, variables) => {
      // Update the cache instantly without refetching everything (Optimistic-ish)
      queryClient.setQueryData(
        ["products", page, debouncedSearch],
        (old: ApiResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((p) =>
              p.sku === variables.sku
                ? { ...p, visible: !variables.currentStatus }
                : p,
            ),
          };
        },
      );
      toast.success(
        variables.currentStatus ? "Product Hidden" : "Product Visible",
      );
    },
    onError: () => toast.error("Failed to update visibility"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (sku: string) => {
      // Assuming your endpoint is DELETE /api/products/:sku
      await axiosInstance.delete(`/api/products/${sku}`);
    },
    onSuccess: () => {
      toast.success("Product deleted");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => toast.error("Failed to delete product"),
  });

  const handleDelete = (sku: string) => {
    if (
      confirm(
        "Are you sure you want to delete this product? This cannot be undone.",
      )
    ) {
      deleteMutation.mutate(sku);
    }
  };

  // --- RENDER ---
  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your store inventory
          </p>
        </div>
        <Link
          href="/dashboard/products/add"
          className="bg-black text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition shadow-lg"
        >
          <Plus size={18} /> Add Product
        </Link>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by Name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading && !data ? (
          <div className="p-20 flex justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : isError ? (
          <div className="p-20 text-center text-red-500">
            Failed to load products
          </div>
        ) : data?.data.length === 0 ? (
          <div className="p-20 flex flex-col items-center text-gray-400">
            <PackageX size={48} className="mb-4 opacity-50" />
            <p>No products found.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 font-medium uppercase tracking-wider text-xs">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.data.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition">
                  {/* Product Info */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden border border-gray-200 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {product.images[0]?.url && (
                          <img
                            src={product.images[0].url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.category?.name || "Uncategorized"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-gray-500 font-mono text-xs">
                    {product.sku}
                  </td>
                  <td className="p-4 font-medium">
                    Rs. {product.price.toLocaleString()}
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${product.stock > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                    >
                      {product.stock} in stock
                    </span>
                  </td>

                  {/* Visibility Toggle */}
                  <td className="p-4 text-center">
                    <button
                      onClick={() =>
                        toggleMutation.mutate({
                          sku: product.sku,
                          currentStatus: product.visible,
                        })
                      }
                      disabled={toggleMutation.isPending}
                      className={`p-2 rounded-full transition-colors ${
                        product.visible
                          ? "text-green-600 hover:bg-green-50"
                          : "text-gray-400 hover:bg-gray-100"
                      }`}
                      title={product.visible ? "Publicly Visible" : "Hidden"}
                    >
                      {product.visible ? (
                        <Eye size={20} />
                      ) : (
                        <EyeOff size={20} />
                      )}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <Link
                      href={`/dashboard/products/edit/${product.sku}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
                    >
                      <Edit size={16} /> Edit
                    </Link>
                  </td>

                  {/* Stock Column Update */}
                  <td className="p-4">
                    {/* Check if we have variants */}
                    {product.variants && product.variants.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {product.variants.map((v, i) => (
                          <span
                            key={i}
                            className={`text-xs px-2 py-0.5 rounded border w-fit ${v.stock > 0 ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-700"}`}
                          >
                            {v.size}: <strong>{v.stock}</strong>
                          </span>
                        ))}
                        {/* Optional: Show total */}
                        <span className="text-[10px] text-gray-400 mt-1">
                          Total: {product.stock}
                        </span>
                      </div>
                    ) : (
                      // Simple Product Stock
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${product.stock > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                      >
                        {product.stock} in stock
                      </span>
                    )}
                  </td>

                  {/* Actions Column Update */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/products/edit/${product.sku}`}
                        className="..."
                      >
                        <Edit size={16} />
                      </Link>

                      {/* DELETE BUTTON */}
                      <button
                        onClick={() => handleDelete(product.sku)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                        title="Delete Product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* PAGINATION */}
        <div className="bg-gray-50 border-t border-gray-200 p-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page <span className="font-medium">{page}</span> of{" "}
            <span className="font-medium">
              {data?.pagination.totalPages || 1}
            </span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border rounded hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!data || page >= data.pagination.totalPages}
              className="p-2 border rounded hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
