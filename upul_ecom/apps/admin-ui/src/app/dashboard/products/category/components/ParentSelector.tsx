'use client';

import { useState, useEffect } from 'react';
import axiosInstance from "@/app/utils/axiosInstance";
import { ChevronRight, ChevronDown, FolderTree, CornerDownRight, CheckCircle2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface ParentSelectorProps {
  onSelectionChange: (lastValidId: string | null) => void;
  refreshTrigger: number;
  initialCategoryId?: string;
}

export default function ParentSelector({ 
  onSelectionChange, 
  refreshTrigger, 
  initialCategoryId 
}: ParentSelectorProps) {
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [levelOptions, setLevelOptions] = useState<Category[][]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Helper to fetch data
  const fetchCategories = async (parentId: string | null) => {
    const url = parentId ? `/api/categories?parentId=${parentId}` : `/api/categories?roots=true`;
    try {
      const res = await axiosInstance.get(url);
      return res.data || [];
    } catch (err) {
      console.error("Fetch error", err);
      return [];
    }
  };

  // Hydration Logic
  useEffect(() => {
    const hydrate = async () => {
      setIsLoading(true);
      if (!initialCategoryId) {
        const roots = await fetchCategories(null);
        setLevelOptions([roots]);
        setIsLoading(false);
        return;
      }

      try {
        const pathRes = await axiosInstance.get(`/api/categories/path/${initialCategoryId}`);
        const path = pathRes.data; 
        const pathIds = path.map((p: any) => p.id);
        setSelectedIds(pathIds);

        const optionPromises = [
          fetchCategories(null),
          ...path.map((p: any) => fetchCategories(p.id))
        ];

        const allOptions = await Promise.all(optionPromises);
        const validOptions = allOptions.filter(opts => opts.length > 0);
        setLevelOptions(validOptions);
        
        onSelectionChange(initialCategoryId);
      } catch (error) {
        console.error("Hydration failed", error);
      } finally {
        setIsLoading(false);
      }
    };
    hydrate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCategoryId, refreshTrigger]);

  const handleSelect = async (levelIndex: number, selectedId: string) => {
    const newSelectedIds = selectedIds.slice(0, levelIndex);
    if (selectedId !== "") newSelectedIds.push(selectedId);
    
    setSelectedIds(newSelectedIds); 
    const currentOptionsSlice = levelOptions.slice(0, levelIndex + 1);
    setLevelOptions(currentOptionsSlice);

    const lastId = newSelectedIds.length > 0 ? newSelectedIds[newSelectedIds.length - 1] : null;
    onSelectionChange(lastId);

    if (selectedId !== "") {
      const children = await fetchCategories(selectedId);
      if (children.length > 0) {
        setLevelOptions([...currentOptionsSlice, children]);
      }
    }
  };

  const getCategoryName = (levelIdx: number, id: string) => {
      return levelOptions[levelIdx]?.find(c => c.id === id)?.name || "Unknown";
  };

  if (isLoading) {
    return (
        <div className="space-y-6 animate-pulse p-2">
            <div className="h-14 bg-gray-200 dark:bg-slate-700 rounded-2xl w-full"></div>
            <div className="h-14 bg-gray-200 dark:bg-slate-700 rounded-2xl w-3/4 ml-12 mt-6"></div>
        </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      
      {/* 1. THE DROPDOWNS TREE */}
      <div>
          {levelOptions.map((options, index) => (
            <div 
                key={index} 
                className={`relative transition-all duration-500 ease-out ${index > 0 ? "mt-6" : ""}`}
                style={{ marginLeft: `${index * 40}px` }}
            > 
              
              {/* Connector Lines (Calculated to sit BEHIND) */}
              {index > 0 && (
                <div 
                    className="absolute border-l-2 border-b-2 border-gray-300 dark:border-slate-600 rounded-bl-3xl -z-10 pointer-events-none"
                    style={{
                        left: '-12px',    // (Indent 40px) - (Icon Center 28px) = -12px alignment
                        top: '-44px',     // Start from parent center
                        width: '32px',    // Reach current icon
                        height: '74px'    // Vertical span
                    }}
                ></div>
              )}

              <div className="flex items-center gap-4 relative z-20">
                  
                  {/* Icon Box */}
                  <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all relative z-20 ${
                      selectedIds[index] 
                      ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20" 
                      : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400"
                  }`}>
                      {index === 0 ? <FolderTree size={24} /> : <CornerDownRight size={24} />}
                  </div>

                  {/* Custom Select Input */}
                  <div className="relative w-full group z-20">
                    <label className="absolute -top-2.5 left-4 px-1.5 bg-gray-50 dark:bg-slate-800/50 backdrop-blur-sm text-[10px] font-extrabold text-gray-400 uppercase tracking-widest z-30">
                        {index === 0 ? "Main Department" : `Sub-Category L${index}`}
                    </label>
                    
                    <select
                        className="appearance-none block w-full h-14 pl-5 pr-12 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-base font-semibold text-gray-700 dark:text-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all cursor-pointer shadow-sm hover:border-blue-300 dark:hover:border-blue-700"
                        value={selectedIds[index] || ""}
                        onChange={(e) => handleSelect(index, e.target.value)}
                    >
                        <option value="">-- Select Category --</option>
                        {options.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                        ))}
                    </select>
                    
                    {/* Custom Chevron */}
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-blue-500 transition-colors z-30">
                        <ChevronDown size={20} strokeWidth={2.5} />
                    </div>
                  </div>
              </div>
            </div>
          ))}
      </div>

      {/* 2. BREADCRUMB SUMMARY */}
      {selectedIds.length > 0 && (
          <div className="mt-8 p-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-2xl flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                <CheckCircle2 size={20} />
              </div>
              <div className="flex flex-col gap-1 pt-0.5">
                  <span className="font-bold text-xs uppercase tracking-widest text-blue-400 dark:text-blue-500">Selected Path</span>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-blue-900 dark:text-blue-100">
                      {selectedIds.map((id, idx) => (
                          <div key={id} className="flex items-center gap-2">
                              {idx > 0 && <ChevronRight size={14} className="opacity-40" />}
                              <span className="font-bold border-b-2 border-blue-200 dark:border-blue-800 pb-0.5">
                                  {getCategoryName(idx, id)}
                              </span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}