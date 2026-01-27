"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axiosInstance";
import { Package, Trash2, Plus, AlertCircle } from "lucide-react";

interface SizeType {
  id: string;
  name: string;
  values: string[];
}

interface Variant {
  size: string;
  stock: number;
}

interface StockManagerProps {
  onUpdate: (data: { sizeType: string; variants: Variant[] }) => void;
  initialData?: { sizeType: string; variants: Variant[] };
}

export default function StockManager({
  onUpdate,
  initialData,
}: StockManagerProps) {
  // 1. Fetch Size Types using TanStack Query
  const { data: sizeTypes = [], isLoading } = useQuery<SizeType[]>({
    queryKey: ["size-types"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/size-types", {
        isPublic: true,
      });
      return res.data;
    },
  });

  const [selectedType, setSelectedType] = useState(initialData?.sizeType || "");
  const [variants, setVariants] = useState<Variant[]>(
    initialData?.variants || [],
  );
  const [currentSize, setCurrentSize] = useState("");
  const [currentStock, setCurrentStock] = useState("");

  // 2. Set default selection when data loads
  useEffect(() => {
    if (sizeTypes.length > 0 && !selectedType) {
      setSelectedType(sizeTypes[0].name);
    }
  }, [sizeTypes, selectedType]);

  // 3. Sync with parent form
  useEffect(() => {
    onUpdate({ sizeType: selectedType, variants });
  }, [variants, selectedType, onUpdate]);

  // 4. Filter out sizes that are already added to the table
  const availableSizes = useMemo(() => {
    const type = sizeTypes.find((t) => t.name === selectedType);
    if (!type) return [];
    return type.values.filter((size) => !variants.some((v) => v.size === size));
  }, [sizeTypes, selectedType, variants]);

  const handleAdd = () => {
    const stockValue = parseInt(currentStock);
    if (!currentSize || isNaN(stockValue) || stockValue < 0) {
      alert("Stock cannot be negative!");
      return;
    }
    const newVariant = { size: currentSize, stock: stockValue };
    setVariants([...variants, newVariant]);

    setCurrentSize("");
    setCurrentStock("");
  };

  const handleRemove = (size: string) => {
    setVariants(variants.filter((v) => v.size !== size));
  };

  if (isLoading)
    return <div className="p-4 bg-gray-50 rounded-lg animate-pulse h-40" />;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Package className="text-gray-400" size={20} />
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-tight">
          Stock & Variants
        </h2>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">
          Measurement Standard
        </label>
        {sizeTypes.length > 0 ? (
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setVariants([]); // Reset variants if switching from "Shoes" to "Shirts"
            }}
            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-black outline-none transition"
          >
            {sizeTypes.map((type) => (
              <option key={type.id} value={type.name}>
                {type.name}
              </option>
            ))}
          </select>
        ) : (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs">
            <AlertCircle size={16} />
            <span>No size standards found in settings.</span>
          </div>
        )}
      </div>

      {/* --- Add Variant Row --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end bg-gray-50 p-4 rounded-xl border border-gray-100">
        <div className="flex-1">
          <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">
            Size
          </label>
          <select
            value={currentSize}
            onChange={(e) => setCurrentSize(e.target.value)}
            className="w-full p-2.5 border border-gray-200 rounded-lg bg-white focus:border-black outline-none"
            disabled={availableSizes.length === 0}
          >
            <option value="">
              {availableSizes.length === 0 ? "All sizes added" : "-- Choose --"}
            </option>
            {availableSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-32">
          <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">
            Qty
          </label>
          <input
            type="number"
            min="0"
            value={currentStock}
            onChange={(e) => setCurrentStock(e.target.value)}
            className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-black outline-none"
            placeholder="0"
          />
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!currentSize || !currentStock}
          className="flex items-center justify-center gap-2 bg-black text-white px-4 py-2.5 rounded-lg hover:bg-gray-800 disabled:opacity-30 transition font-medium"
        >
          <Plus size={18} /> Add
        </button>
      </div>

      {/* --- Variants Table --- */}
      {variants.length > 0 && (
        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold text-[10px] uppercase tracking-wider">
              <tr>
                <th className="p-4">Size</th>
                <th className="p-4">Available Stock</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {variants.map((v, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="p-4 font-mono font-bold text-gray-900">
                    {v.size}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium ${v.stock < 10 ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600"}`}
                    >
                      {v.stock} pcs
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemove(v.size)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-black text-white">
              <tr className="font-bold">
                <td className="p-4">Total Inventory</td>
                <td className="p-4" colSpan={2}>
                  {variants.reduce((acc, curr) => acc + curr.stock, 0)} units
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
