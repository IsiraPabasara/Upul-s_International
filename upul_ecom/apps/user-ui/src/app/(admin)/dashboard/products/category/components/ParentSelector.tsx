'use client';

import { useState, useEffect } from 'react';
import axiosInstance from "@/app/utils/axiosInstance";

interface Category {
  id: string;
  name: string;
}

interface ParentSelectorProps {
  onSelectionChange: (lastValidId: string | null) => void;
  refreshTrigger: number;
  initialCategoryId?: string; // 👈 NEW PROP for Editing
}

export default function ParentSelector({ 
  onSelectionChange, 
  refreshTrigger, 
  initialCategoryId 
}: ParentSelectorProps) {
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [levelOptions, setLevelOptions] = useState<Category[][]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. FETCH HELPER
  const fetchCategories = async (parentId: string | null) => {
    // If parentId is null, ask for ROOTS. Otherwise ask for children.
    const url = parentId 
      ? `/api/categories?parentId=${parentId}`
      : `/api/categories?roots=true`; // 👈 Ensures we don't get a messy list

    try {
      const res = await axiosInstance.get(url);
      return res.data || [];
    } catch (err) {
      console.error("Fetch error", err);
      return [];
    }
  };

  // 2. HYDRATION (Auto-Fill for Edit Mode) 💧
  useEffect(() => {
    const hydrate = async () => {
      if (!initialCategoryId) {
        // Create Mode: Just load roots
        const roots = await fetchCategories(null);
        setLevelOptions([roots]);
        return;
      }

      setIsLoading(true);
      try {
        // A. Get the full lineage (Root -> Sub -> Leaf)
        const pathRes = await axiosInstance.get(`/api/categories/path/${initialCategoryId}`);
        const path = pathRes.data; // e.g. [{id: 1, name: Women}, {id: 2, name: Clothing}]
        
        const pathIds = path.map((p: any) => p.id);
        setSelectedIds(pathIds);

        // B. Fetch options for EVERY level simultaneously
        // Level 0: Roots
        // Level 1: Children of Path[0]
        // Level 2: Children of Path[1]
        const optionPromises = [
          fetchCategories(null), // Always fetch roots
          ...path.map((p: any) => fetchCategories(p.id))
        ];

        const allOptions = await Promise.all(optionPromises);

        // We only want options that actually have items (ignore the last empty child list)
        const validOptions = allOptions.filter(opts => opts.length > 0);
        
        setLevelOptions(validOptions);
        
        // Notify parent form of the current selection
        onSelectionChange(initialCategoryId);
      } catch (error) {
        console.error("Failed to hydrate category path", error);
      } finally {
        setIsLoading(false);
      }
    };

    hydrate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCategoryId, refreshTrigger]);

  // 3. HANDLER (User Clicks)
  const handleSelect = async (levelIndex: number, selectedId: string) => {
    const newSelectedIds = selectedIds.slice(0, levelIndex);
    if (selectedId !== "") newSelectedIds.push(selectedId);
    
    setSelectedIds(newSelectedIds);
    
    // Notify parent
    const lastId = newSelectedIds.length > 0 ? newSelectedIds[newSelectedIds.length - 1] : null;
    onSelectionChange(lastId);

    // Fetch next level
    if (selectedId !== "") {
      const children = await fetchCategories(selectedId);
      const newLevelOptions = levelOptions.slice(0, levelIndex + 1);
      
      // Only show next dropdown if there are children
      if (children.length > 0) {
        newLevelOptions.push(children);
      }
      setLevelOptions(newLevelOptions);
    } else {
      // If user selected "Select...", cut off deeper levels
      setLevelOptions(levelOptions.slice(0, levelIndex + 1));
    }
  };

  if (isLoading) return <div className="text-xs text-gray-400 animate-pulse">Loading Category Path...</div>;

  return (
    <div className="space-y-3">
      {levelOptions.map((options, index) => (
        <div key={index} className="flex flex-col animate-in fade-in slide-in-from-top-1">
          <label className="text-xs text-gray-500 mb-1 ml-1 font-medium">
            {index === 0 ? "Main Category (Root)" : `Sub Level ${index}`}
          </label>
          <select
            className="block w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm"
            value={selectedIds[index] || ""}
            onChange={(e) => handleSelect(index, e.target.value)}
          >
            <option value="">-- Select --</option>
            {options.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}