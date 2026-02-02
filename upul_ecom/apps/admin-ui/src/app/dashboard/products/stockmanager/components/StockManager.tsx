"use client";

import { useState, useEffect , useRef } from "react";
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
  const [rows, setRows] = useState<VariantRow[]>([
    { id: Date.now(), size: "", stock: 0 }
  ]);

  // 2. HYDRATION (Load Data)
  useEffect(() => {
    // 👇 3. STOP if we already hydrated
    if (hasHydrated.current) return;

    let dataLoaded = false;

    if (initialVariants && initialVariants.length > 0) {
      setRows(initialVariants.map((v, i) => ({
        id: Date.now() + i,
        size: v.size,
        stock: v.stock
      })));
      dataLoaded = true;
    }
    
    // Handle Size Type
    if (initialSizeType) {
      setSizeType(initialSizeType);
    } else if (sizeTypes.length > 0 && !sizeType) {
      setSizeType(sizeTypes[0].name);
    }

    // Only mark as hydrated if we actually had initial variants to load
    // This prevents locking it if the data was just empty/loading initially
    if (initialVariants && initialVariants.length > 0) {
       hasHydrated.current = true;
    }

  }, [initialVariants, initialSizeType, sizeTypes, sizeType]);
  
  // 3. SYNC WITH PARENT
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
  const selectedTypeObj = sizeTypes.find(t => t.name === sizeType);
  const currentOptions = selectedTypeObj ? selectedTypeObj.values : [];
  const isDropdown = currentOptions.length > 0;

  // 👇 NEW: Get a list of all sizes currently selected in ANY row
  const selectedSizes = rows.map(r => r.size).filter(s => s !== "");

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
               // Reset rows to avoid invalid sizes sticking around
               setRows([{ id: Date.now(), size: "", stock: 0 }]); 
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
                  {isDropdown ? (
                    <select
                      value={row.size}
                      onChange={(e) => updateRow(row.id, "size", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none cursor-pointer"
                    >
                      <option value="">-- Select Size --</option>
                      {currentOptions.map(opt => {
                        // 👇 LOGIC: Disable if selected elsewhere
                        const isSelectedElsewhere = selectedSizes.includes(opt) && row.size !== opt;
                        
                        return (
                          <option 
                            key={opt} 
                            value={opt} 
                            disabled={isSelectedElsewhere}
                            className={isSelectedElsewhere ? "text-gray-300 bg-gray-50" : ""}
                          >
                            {opt} {isSelectedElsewhere ? "(Selected)" : ""}
                          </option>
                        );
                      })}
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
          disabled={isDropdown && rows.length >= currentOptions.length} // Disable adding if all options are used
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} /> Add Variant
        </button>
      </div>
    </div>
  );
}