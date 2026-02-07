"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, AlertCircle, RefreshCw, Layers, AlertTriangle } from "lucide-react";
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

export default function StockManager({ onUpdate, initialVariants, initialSizeType }: StockManagerProps) {
  
  // 1. FETCH SIZE STANDARDS
  const { data: sizeTypes = [], isLoading } = useQuery<SizeType[]>({
    queryKey: ['size-types'],
    queryFn: async () => {
      const res = await axiosInstance.get('/api/size-types');
      return res.data;
    },
    staleTime: 1000 * 60 * 5, 
  });

  const hasHydrated = useRef(false);
  const [sizeType, setSizeType] = useState<string>("");
  const [rows, setRows] = useState<VariantRow[]>([{ id: Date.now(), size: "", stock: 0 }]);

  // Helper: Get options
  const selectedTypeObj = sizeTypes.find(t => t.name === sizeType);
  const currentOptions = selectedTypeObj ? selectedTypeObj.values : [];
  const isDropdown = currentOptions.length > 0;

  // 2. HYDRATION
  useEffect(() => {
    if (hasHydrated.current) return;

    if (initialVariants && initialVariants.length > 0) {
      setRows(initialVariants.map((v, i) => ({
        id: Date.now() + i,
        size: v.size,
        stock: v.stock
      })));
      hasHydrated.current = true;
    } else if (!isLoading && sizeTypes.length > 0) {
        const defaultType = initialSizeType || sizeTypes[0].name;
        setSizeType(defaultType);
        
        const defaultOptions = sizeTypes.find(t => t.name === defaultType)?.values || [];
        const startSize = defaultOptions.length > 0 ? defaultOptions[0] : "";
        setRows([{ id: Date.now(), size: startSize, stock: 0 }]);
        
        hasHydrated.current = true;
    }
  }, [initialVariants, initialSizeType, sizeTypes, sizeType, isLoading]);
  
  // 3. SYNC
  useEffect(() => {
    const cleanVariants = rows.map(({ size, stock }) => ({ size, stock }));
    onUpdate({ sizeType, variants: cleanVariants });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, sizeType]);

  // --- ACTIONS ---

  const getNextAvailableSize = (currentRows: VariantRow[]) => {
    const usedSizes = currentRows.map(r => r.size);
    return currentOptions.find(opt => !usedSizes.includes(opt));
  };

  const handleTypeChange = (newType: string) => {
    setSizeType(newType);
    const newOptions = sizeTypes.find(t => t.name === newType)?.values || [];
    setRows([{ id: Date.now(), size: newOptions[0] || "", stock: 0 }]);
  };

  const handleAddRow = () => {
    let nextSize = "";
    if (isDropdown) {
        const available = getNextAvailableSize(rows);
        if (!available) return;
        nextSize = available;
    }
    setRows(prev => [...prev, { id: Date.now(), size: nextSize, stock: 0 }]);
  };
  
  const handleRemoveRow = (id: number) => {
    if (rows.length === 1) {
        const resetSize = isDropdown && currentOptions.length > 0 ? getNextAvailableSize([]) || currentOptions[0] : "";
        setRows([{ id: Date.now(), size: resetSize, stock: 0 }]);
        return;
    }
    setRows(prev => prev.filter(row => row.id !== id));
  };

  const updateRow = (id: number, field: "size" | "stock", value: string | number) => {
    setRows(prev => prev.map(row => {
        if (row.id !== id) return row;
        if (field === 'stock') return { ...row, stock: Math.max(0, Number(value)) };
        return { ...row, size: String(value) };
    }));
  };

  // --- SHOW/HIDE LOGIC ---
  const hasOptionsLeft = !isDropdown || rows.length < currentOptions.length;
  const allRowsValid = rows.every(row => row.size && row.stock > 0);
  const canAddMore = hasOptionsLeft && allRowsValid;

  // --- SHARED STYLES (Dark Mode Added) ---
  const inputClass = "w-full h-[38px] px-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-400";

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-top-2">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4 border-b border-gray-50 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Layers size={16} className="text-blue-500"/> Variant Manager
            {isLoading && <RefreshCw className="animate-spin text-gray-400" size={12} />}
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Define sizes and stock levels.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 px-2 py-1.5 rounded-lg border border-gray-100 dark:border-slate-700">
          <label className="text-xs font-semibold text-gray-600 dark:text-slate-300 whitespace-nowrap uppercase tracking-wider">Standard:</label>
          <select 
            value={sizeType}
            onChange={(e) => handleTypeChange(e.target.value)}
            disabled={isLoading}
            className="bg-transparent text-sm font-medium text-gray-900 dark:text-white outline-none cursor-pointer dark:bg-slate-800"
          >
            {isLoading ? <option>Loading...</option> : (
              <>
                {sizeTypes.map((type) => <option key={type.id} value={type.name}>{type.name}</option>)}
                <option value="Custom">Custom</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wide">
            <tr>
              <th className="p-3 pl-4 w-1/2">Size ({sizeType || "Custom"})</th>
              <th className="p-3 w-1/3">Stock Qty</th>
              <th className="p-3 text-right pr-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {rows.map((row) => {
              const isZeroStock = row.stock === 0;
              return (
                <tr 
                    key={row.id} 
                    className={`group transition-colors ${
                        isZeroStock 
                        ? "bg-red-50/30 dark:bg-red-900/10" // Warning BG
                        : "hover:bg-blue-50/30 dark:hover:bg-blue-900/10" // Hover BG
                    }`}
                >
                  <td className="p-3 pl-4">
                    {isDropdown ? (
                      <select
                        value={row.size}
                        onChange={(e) => updateRow(row.id, "size", e.target.value)}
                        className={`${inputClass} cursor-pointer appearance-none`}
                      >
                        {currentOptions.map(opt => {
                          const isSelectedElsewhere = rows.some(r => r.size === opt && r.id !== row.id);
                          return (
                            <option 
                                key={opt} 
                                value={opt} 
                                disabled={isSelectedElsewhere} 
                                className={isSelectedElsewhere ? "text-gray-400 bg-gray-50 dark:bg-slate-800 dark:text-slate-600" : "dark:bg-slate-800"}
                            >
                              {opt} {isSelectedElsewhere ? "(Added)" : ""}
                            </option>
                          );
                        })}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={row.size}
                        onChange={(e) => updateRow(row.id, "size", e.target.value)}
                        placeholder="Size name"
                        className={inputClass}
                      />
                    )}
                  </td>
                  <td className="p-3 relative">
                    <input
                      type="number"
                      value={row.stock}
                      onChange={(e) => updateRow(row.id, "stock", e.target.value)}
                      min="0"
                      className={`${inputClass} font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`} 
                    />
                    {isZeroStock && (
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-red-400 dark:text-red-500 pointer-events-none animate-pulse" title="Required">
                            <AlertTriangle size={14} />
                        </div>
                    )}
                  </td>
                  <td className="p-3 text-right pr-4">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(row.id)}
                      className="h-[38px] w-[38px] flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all ml-auto"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Actions */}
      <div className="mt-4 flex justify-between items-center h-10">
        <div className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full border border-amber-100 dark:border-amber-800/50">
           <AlertCircle size={14} />
           <span>Total Stock: <strong>{rows.reduce((acc, r) => acc + (Number(r.stock) || 0), 0)}</strong></span>
        </div>
        
        {/* Logic: Button is only visible if current rows are valid AND options remain */}
        {canAddMore ? (
            <button
                type="button"
                onClick={handleAddRow}
                className="flex items-center gap-2 text-sm font-semibold text-white bg-black hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700 px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow-md animate-in fade-in zoom-in-95 slide-in-from-right-2"
            >
                <Plus size={16} /> Add Variant
            </button>
        ) : (
            <div className="text-xs text-gray-400 dark:text-slate-500 italic animate-in fade-in">
                {rows.some(r => r.stock === 0) ? "Enter stock to add more..." : "All sizes added."}
            </div>
        )}
      </div>
    </div>
  );
}