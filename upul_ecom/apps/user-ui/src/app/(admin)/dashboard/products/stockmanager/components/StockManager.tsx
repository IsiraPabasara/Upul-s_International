"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, AlertCircle } from "lucide-react";

// Types
interface VariantRow {
  id: number; // Internal ID for React Keys
  size: string;
  stock: number;
}

interface StockManagerProps {
  onUpdate: (data: { sizeType: string; variants: { size: string; stock: number }[] }) => void;
  // 👇 NEW PROPS for Edit Mode
  initialVariants?: { size: string; stock: number }[];
  initialSizeType?: string;
}

export default function StockManager({ 
  onUpdate, 
  initialVariants, 
  initialSizeType 
}: StockManagerProps) {
  
  // State
  const [sizeType, setSizeType] = useState<string>("Standard");
  const [rows, setRows] = useState<VariantRow[]>([
    { id: Date.now(), size: "", stock: 0 } // Default empty row
  ]);

  // --- 1. HYDRATION (Load Existing Data) ---
  useEffect(() => {
    // If we have initial data (Edit Mode), load it
    if (initialVariants && initialVariants.length > 0) {
      const hydratedRows = initialVariants.map((v, index) => ({
        id: Date.now() + index, // Generate unique IDs
        size: v.size,
        stock: v.stock
      }));
      setRows(hydratedRows);
    }

    if (initialSizeType) {
      setSizeType(initialSizeType);
    }
  }, [initialVariants, initialSizeType]);

  // --- 2. SYNC WITH PARENT ---
  useEffect(() => {
    // Convert internal rows to clean data for the parent form
    const cleanVariants = rows.map(({ size, stock }) => ({ size, stock }));
    onUpdate({ sizeType, variants: cleanVariants });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, sizeType]);

  // --- HANDLERS ---
  const handleAddRow = () => {
    setRows(prev => [...prev, { id: Date.now(), size: "", stock: 0 }]);
  };

  const handleRemoveRow = (id: number) => {
    if (rows.length === 1) {
      // Don't remove the last row, just clear it
      setRows([{ id: Date.now(), size: "", stock: 0 }]);
      return;
    }
    setRows(prev => prev.filter(row => row.id !== id));
  };

  const updateRow = (id: number, field: "size" | "stock", value: string | number) => {
    setRows(prev => prev.map(row => {
      if (row.id === id) {
        return { ...row, [field]: value };
      }
      return row;
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 animate-in fade-in slide-in-from-top-2">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-semibold text-gray-800">Variant Manager</h3>
          <p className="text-sm text-gray-500">Manage sizes and stock levels for this product.</p>
        </div>
        
        {/* Size Type Selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Size Standard:</label>
          <select 
            value={sizeType}
            onChange={(e) => setSizeType(e.target.value)}
            className="p-2 border border-gray-300 rounded-md text-sm bg-gray-50 focus:ring-2 focus:ring-black/5 outline-none"
          >
            <option value="Standard">Standard (S, M, L)</option>
            <option value="US">US Sizes (4, 6, 8)</option>
            <option value="EU">EU Sizes (36, 38, 40)</option>
            <option value="UK">UK Sizes (8, 10, 12)</option>
            <option value="Shoes">Shoe Sizes (40, 41, 42)</option>
            <option value="Kids">Kids Ages (2Y, 3Y, 4Y)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium">
            <tr>
              <th className="p-3 w-1/3">Size Label</th>
              <th className="p-3 w-1/3">Stock Quantity</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row, index) => (
              <tr key={row.id} className="group hover:bg-gray-50/50 transition-colors">
                <td className="p-3">
                  <input
                    type="text"
                    value={row.size}
                    onChange={(e) => updateRow(row.id, "size", e.target.value)}
                    placeholder={sizeType === "Shoes" ? "e.g. 42" : "e.g. XL"}
                    className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none transition"
                  />
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    value={row.stock}
                    onChange={(e) => updateRow(row.id, "stock", Number(e.target.value))}
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none transition"
                  />
                </td>
                <td className="p-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(row.id)}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded transition"
                    title="Remove Variant"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Actions */}
      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
           <AlertCircle size={14} />
           <span>Total Stock: <strong>{rows.reduce((acc, r) => acc + (Number(r.stock) || 0), 0)}</strong></span>
        </div>

        <button
          type="button"
          onClick={handleAddRow}
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg transition"
        >
          <Plus size={16} />
          Add Another Size
        </button>
      </div>
    </div>
  );
}