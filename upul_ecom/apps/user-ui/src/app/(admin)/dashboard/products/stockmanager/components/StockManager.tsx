"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, AlertCircle, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axiosInstance";

// Types
interface SizeType {
  id: string;
  name: string;
  values: string[];
}

interface VariantRow {
  id: number;
  size: string;
  stock: number;
}

interface StockManagerProps {
  onUpdate: (data: { sizeType: string; variants: { size: string; stock: number }[] }) => void;
  initialVariants?: { size: string; stock: number }[];
  initialSizeType?: string;
}

export default function StockManager({ 
  onUpdate, 
  initialVariants, 
  initialSizeType 
}: StockManagerProps) {
  
  // 1. FETCH SIZE STANDARDS FROM DB 🌍
  const { data: sizeTypes = [], isLoading } = useQuery<SizeType[]>({
    queryKey: ['size-types'],
    queryFn: async () => {
      const res = await axiosInstance.get('/api/size-types'); // Assuming public endpoint or auth header is handled
      return res.data;
    },
    // Optional: Keep data fresh but don't refetch constantly
    staleTime: 1000 * 60 * 5, 
  });

  const [sizeType, setSizeType] = useState<string>("");
  const [rows, setRows] = useState<VariantRow[]>([
    { id: Date.now(), size: "", stock: 0 }
  ]);

  // 2. HYDRATION (Load Data)
  useEffect(() => {
    if (initialVariants && initialVariants.length > 0) {
      setRows(initialVariants.map((v, i) => ({
        id: Date.now() + i,
        size: v.size,
        stock: v.stock
      })));
    }
    
    // Set initial type, or default to the first available one from DB once loaded
    if (initialSizeType) {
      setSizeType(initialSizeType);
    } else if (sizeTypes.length > 0 && !sizeType) {
      setSizeType(sizeTypes[0].name);
    }
  }, [initialVariants, initialSizeType, sizeTypes, sizeType]);

  // 3. SYNC WITH PARENT FORM
  useEffect(() => {
    const cleanVariants = rows.map(({ size, stock }) => ({ size, stock }));
    onUpdate({ sizeType, variants: cleanVariants });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, sizeType]);

  const handleAddRow = () => {
    setRows(prev => [...prev, { id: Date.now(), size: "", stock: 0 }]);
  };

  const handleRemoveRow = (id: number) => {
    if (rows.length === 1) {
      setRows([{ id: Date.now(), size: "", stock: 0 }]);
      return;
    }
    setRows(prev => prev.filter(row => row.id !== id));
  };

  const updateRow = (id: number, field: "size" | "stock", value: string | number) => {
    setRows(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  // 4. DETERMINE OPTIONS
  // Find the currently selected Size Type object from the DB list
  const selectedTypeObj = sizeTypes.find(t => t.name === sizeType);
  
  // If we found it, use its values. If not (or if "Custom"), use empty array.
  const currentOptions = selectedTypeObj ? selectedTypeObj.values : [];
  
  // If we have options, it's a Dropdown. If not, it's a Text Input (Custom).
  const isDropdown = currentOptions.length > 0;

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 animate-in fade-in slide-in-from-top-2">
      
      {/* Header & Type Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            Variant Manager
            {isLoading && <RefreshCw className="animate-spin text-gray-400" size={14} />}
          </h3>
          <p className="text-sm text-gray-500">Manage sizes and stock levels.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Size Type:</label>
          <select 
            value={sizeType}
            onChange={(e) => {
               setSizeType(e.target.value);
               // Optional: Clear rows when switching types to prevent mismatched data
               // setRows([{ id: Date.now(), size: "", stock: 0 }]); 
            }}
            disabled={isLoading}
            className="p-2 border border-gray-300 rounded-md text-sm bg-gray-50 focus:ring-2 focus:ring-black/5 outline-none min-w-[150px]"
          >
            {isLoading ? (
               <option>Loading...</option>
            ) : (
              <>
                {sizeTypes.map((type) => (
                  <option key={type.id} value={type.name}>{type.name}</option>
                ))}
                <option value="Custom">Custom (Manual Input)</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium">
            <tr>
              <th className="p-3 w-1/2">Size ({sizeType || "Custom"})</th>
              <th className="p-3 w-1/3">Stock Qty</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
              <tr key={row.id} className="group hover:bg-gray-50/50 transition-colors">
                <td className="p-3">
                  {/* 👇 CONDITIONAL INPUT: Dropdown vs Text */}
                  {isDropdown ? (
                    <select
                      value={row.size}
                      onChange={(e) => updateRow(row.id, "size", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none cursor-pointer"
                    >
                      <option value="">-- Select Size --</option>
                      {currentOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={row.size}
                      onChange={(e) => updateRow(row.id, "size", e.target.value)}
                      placeholder="Enter custom size"
                      className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none"
                    />
                  )}
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    value={row.stock}
                    onChange={(e) => updateRow(row.id, "stock", Number(e.target.value))}
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none"
                  />
                </td>
                <td className="p-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(row.id)}
                    className="text-gray-400 hover:text-red-500 p-2 rounded transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
           <AlertCircle size={14} />
           <span>Total Stock: <strong>{rows.reduce((acc, r) => acc + (Number(r.stock) || 0), 0)}</strong></span>
        </div>
        <button
          type="button"
          onClick={handleAddRow}
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition"
        >
          <Plus size={16} /> Add Variant
        </button>
      </div>
    </div>
  );
}