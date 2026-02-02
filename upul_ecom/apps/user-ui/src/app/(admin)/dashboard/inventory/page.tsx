    "use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axiosInstance";
import {
  Search,
  Loader2,
  Save,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
// 👇 IMPORT TOASTER HERE
import toast, { Toaster } from "react-hot-toast";

// --- TYPES ---
interface Variant {
  size: string;
  stock: number;
}
interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  variants: Variant[];
  images: { url: string }[];
}
interface InventoryRow {
  uniqueKey: string;
  productId: string;
  name: string;
  sku: string;
  image: string;
  variantSize: string | null;
  currentStock: number;
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

// Store edits as a Record: { "sku-size": newStockValue }
type EditsRecord = Record<string, number>;

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ⭐ LOCAL STATE FOR UNSAVED CHANGES
  // Store full update objects: { "uniqueKey": { sku, variantSize, newStock } }
  const [pendingUpdates, setPendingUpdates] = useState<
    Record<
      string,
      { sku: string; variantSize: string | null; newStock: number }
    >
  >({});

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 1. FETCH DATA (With Pagination)
  const { data, isLoading } = useQuery<ApiResponse>({
    queryKey: ["inventory", page, debouncedSearch],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/products/inventory/list", {
        params: { search: debouncedSearch, page, limit: 15 }, // 15 per page
      });
      return res.data;
    },
    placeholderData: (prev) => prev, // Keep old data while fetching next page
  });

  // 2. FLATTEN DATA
  const tableRows: InventoryRow[] = (data?.data || []).flatMap(
    (product: any) => {
      const hasVariants = product.variants && product.variants.length > 0;
      const imgUrl = product.images?.[0]?.url || "";

      if (hasVariants) {
        return product.variants.map((v: any) => ({
          uniqueKey: `${product.sku}-${v.size}`,
          productId: product.id,
          name: product.name,
          sku: product.sku,
          image: imgUrl,
          variantSize: v.size,
          currentStock: v.stock,
        }));
      } else {
        return [
          {
            uniqueKey: product.sku,
            productId: product.id,
            name: product.name,
            sku: product.sku,
            image: imgUrl,
            variantSize: null,
            currentStock: product.stock,
          },
        ];
      }
    },
  );

  // 3. BULK SAVE MUTATION 📦
  const executeBulkSave = useMutation({
    mutationFn: async () => {
      const updatesArray = Object.values(pendingUpdates);
      if (updatesArray.length === 0) return;

      await axiosInstance.patch("/api/products/inventory/bulk-update", {
        updates: updatesArray,
      });
    },
    // ✅ SUCCESS: Show Green Message & Clear State
    onSuccess: () => {
      toast.success("Stock updated successfully!", {
        duration: 4000,
        style: {
          border: "1px solid #4ade80", // Green Border
          padding: "16px",
          color: "#166534", // Dark Green Text
          fontWeight: "600",
          background: "#f0fdf4", // Light Green Background
        },
        iconTheme: {
          primary: "#22c55e",
          secondary: "#FFFFFF",
        },
      });

      // 🧹 This line CLEARS the blue edits. It only runs if successful.
      setPendingUpdates({});

      // Refresh data from server
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    
    onError: (err: any) => {
      console.error("Bulk save error:", err);
      toast.error("Save failed, but changes were discarded.", {
        duration: 4000,
        style: {
          border: "1px solid #ef4444",
          padding: "16px",
          color: "#991b1b",
          fontWeight: "600",
          background: "#fef2f2",
        },
        iconTheme: {
          primary: "#ef4444",
          secondary: "#FFFFFF",
        },
      });

      // 👇 ADD THIS LINE: This forces the "Unsaved Changes" bar to vanish
      setPendingUpdates({}); 
    },
  });

  const handleEdit = (row: InventoryRow, val: string) => {
    const newVal = parseInt(val);
    if (isNaN(newVal) || newVal < 0) return;

    // Check if value is actually different from original
    if (newVal === row.currentStock) {
      // If user sets it back to original, remove from pending
      const copy = { ...pendingUpdates };
      delete copy[row.uniqueKey];
      setPendingUpdates(copy);
      return;
    }

    setPendingUpdates((prev) => ({
      ...prev,
      [row.uniqueKey]: {
        sku: row.sku,
        variantSize: row.variantSize,
        newStock: newVal,
      },
    }));
  };

  const totalUnsaved = Object.keys(pendingUpdates).length;

  return (
    <div className="max-w-6xl mx-auto p-6 pb-20">
      
      {/* 👇 ADDED THIS: The Toaster makes the alerts visible! */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* ⭐ FLOATING SAVE BAR (Shows only when changes exist) */}
      {totalUnsaved > 0 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 animate-in slide-in-from-top-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="font-semibold text-sm">
              {totalUnsaved} Unsaved Changes
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPendingUpdates({})}
              className="px-3 py-1 hover:bg-white/10 rounded-md text-xs text-gray-300 transition"
            >
              Discard
            </button>
            <button
              onClick={() => executeBulkSave.mutate()}
              disabled={executeBulkSave.isPending}
              className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-bold hover:bg-gray-200 transition flex items-center gap-2"
            >
              {executeBulkSave.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Manager</h1>
        <p className="text-gray-500 text-sm">Bulk edit stock levels.</p>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex gap-3">
        <Search className="text-gray-400" />
        <input
          type="text"
          placeholder="Search SKU or Product Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full outline-none bg-transparent font-medium"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="animate-spin text-gray-400" />
          </div>
        ) : tableRows.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No products found.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-semibold border-b">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Variant</th>
                <th className="p-4 text-center">State</th>
                <th className="p-4 text-right">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tableRows.map((row) => {
                // Check if this row is edited locally
                const isEdited = pendingUpdates[row.uniqueKey] !== undefined;
                const displayStock = isEdited
                  ? pendingUpdates[row.uniqueKey].newStock
                  : row.currentStock;

                // Determine Stock Status Color
                let stockClass = "";

                if (isEdited) {
                  // 🔵 EDITED (Unsaved)
                  stockClass =
                    "text-blue-700 border-blue-300 bg-white ring-2 ring-blue-100";
                } else if (displayStock === 0) {
                  // 🔴 OUT OF STOCK (Critical)
                  stockClass =
                    "text-red-600 bg-red-50 border-red-300 ring-1 ring-red-100";
                } else if (displayStock < 5) {
                  // 🟠 LOW STOCK (Warning)
                  stockClass =
                    "text-amber-700 bg-amber-50 border-amber-300 ring-1 ring-amber-100";
                } else {
                  // 🟢 HEALTHY STOCK (Good)
                  stockClass =
                    "text-green-700 bg-green-50 border-green-200 focus:ring-green-100";
                }

                return (
                  <tr
                    key={row.uniqueKey}
                    className={`transition ${isEdited ? "bg-blue-50/50" : "hover:bg-gray-50"}`}
                  >
                    {/* Product Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded border overflow-hidden shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {row.image && (
                            <img
                              src={row.image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <span className="font-medium text-gray-900 line-clamp-1">
                          {row.name}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 font-mono text-xs text-gray-500">
                      {row.sku}
                    </td>

                    {/* Variant Column */}
                    <td className="p-4">
                      {row.variantSize ? (
                        <span className="bg-white text-gray-700 px-2 py-1 rounded text-xs font-bold border border-gray-200 shadow-sm">
                          {row.variantSize}
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs font-medium border border-gray-200 italic">
                          Single Size
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-center">
                      {isEdited ? (
                        <span className="text-xs font-bold text-blue-600 flex justify-center items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />{" "}
                          Changed
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Synced</span>
                      )}
                    </td>

                    {/* Stock Input (Now Color Coded) */}
                    <td className="p-4 text-right">
                      <input
                        type="number"
                        value={displayStock}
                        min={0}
                        onChange={(e) => handleEdit(row, e.target.value)}
                        className={`w-24 p-2 text-right font-bold border rounded-lg outline-none focus:ring-2 transition ${stockClass}`}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* PAGINATION */}
        <div className="bg-gray-50 border-t border-gray-200 p-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page <span className="font-medium">{data?.pagination.page}</span> of{" "}
            <span className="font-medium">{data?.pagination.totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border rounded hover:bg-white disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!data || page >= data.pagination.totalPages}
              className="p-2 border rounded hover:bg-white disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}