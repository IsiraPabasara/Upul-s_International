'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/app/utils/axiosInstance';
import toast from 'react-hot-toast';
import { Plus, Check, X, Loader2, ChevronDown } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
}

interface BrandSelectorProps {
  selectedBrand: string;
  onChange: (brandName: string) => void;
}

export default function BrandSelector({ selectedBrand, onChange }: BrandSelectorProps) {
  const queryClient = useQueryClient();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  
  // Custom Dropdown State
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 1. Fetch Brands
  const { data: brands = [], isLoading } = useQuery<Brand[]>({
    queryKey: ['brands'],
    queryFn: async () => {
      const res = await axiosInstance.get('/api/brands', { isPublic: true });
      return res.data;
    },
  });

  // 2. Create Brand
  const createBrandMutation = useMutation({
    mutationFn: (name: string) => axiosInstance.post('/api/brands', { name }),
    onSuccess: (response) => {
      const newBrand = response.data;
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      onChange(newBrand.name);
      setIsAddingNew(false);
      setNewBrandName('');
      toast.success('Brand added successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Brand already exists");
    },
  });

  const handleCreateBrand = () => {
    if (!newBrandName.trim()) return;
    createBrandMutation.mutate(newBrandName);
  };

  // Shared responsive input styles
  const baseInputStyles = "w-full h-[44px] sm:h-[46px] px-4 bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none transition-all text-sm sm:text-base font-medium";

  return (
    <div className="w-full">
      {!isAddingNew ? (
        <div className="flex gap-2 sm:gap-3">
          
          {/* CUSTOM DROPDOWN WRAPPER */}
          <div ref={dropdownRef} className="relative w-full group">
            
            {/* Dropdown Trigger Button */}
            <button
              type="button"
              onClick={() => !isLoading && setIsOpen(!isOpen)}
              className={`${baseInputStyles} flex items-center justify-between hover:border-blue-300 dark:hover:border-blue-800/50 ${isOpen ? 'ring-4 ring-blue-500/10 border-blue-500 bg-white dark:bg-slate-900' : ''} ${isLoading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
            >
              <span className={`block truncate pr-4 ${selectedBrand ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                {isLoading ? 'Loading brands...' : (selectedBrand || 'Select a Brand')}
              </span>
              <ChevronDown 
                size={18} 
                strokeWidth={2.5} 
                className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : 'text-gray-400 group-hover:text-blue-500'}`} 
              />
            </button>
            
            {/* Dropdown Menu */}
            {isOpen && !isLoading && (
              <div className="absolute z-[100] w-full mt-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl max-h-[240px] overflow-y-auto py-2 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 custom-scrollbar">
                {brands.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-400 text-center font-medium">
                    No brands found. Click + to add one.
                  </div>
                ) : (
                  brands
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((brand) => (
                      <button
                        key={brand.id}
                        type="button"
                        onClick={() => {
                          onChange(brand.name);
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm sm:text-base transition-colors ${
                          selectedBrand === brand.name 
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-bold' 
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 font-medium'
                        }`}
                      >
                        <span className="truncate">{brand.name}</span>
                        {selectedBrand === brand.name && (
                           <Check size={16} strokeWidth={3} className="shrink-0 animate-in zoom-in duration-200" />
                        )}
                      </button>
                    ))
                )}
              </div>
            )}
          </div>
          
          {/* Add Button */}
          <button
            type="button"
            onClick={() => setIsAddingNew(true)}
            className="h-[44px] sm:h-[46px] w-[44px] sm:w-[46px] flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-800/50 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-all shrink-0 hover:shadow-md hover:shadow-blue-500/20 active:scale-95"
            title="Add New Brand"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </div>
      ) : (
        /* Add Mode */
        <div className="flex gap-2 sm:gap-3 animate-in fade-in zoom-in-95 slide-in-from-left-2 duration-200">
          <input
            type="text"
            className={`${baseInputStyles} shadow-inner bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-200 placeholder:text-gray-400`}
            placeholder="New brand"
            value={newBrandName}
            onChange={(e) => setNewBrandName(e.target.value)}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateBrand())}
          />
          <button
            type="button"
            onClick={handleCreateBrand}
            disabled={createBrandMutation.isPending || !newBrandName.trim()}
            className="h-[44px] sm:h-[46px] w-[44px] sm:w-[46px] flex items-center justify-center bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:hover:bg-emerald-500 shrink-0 shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 active:scale-95"
            title="Save Brand"
          >
            {createBrandMutation.isPending ? <Loader2 className="animate-spin" size={20} strokeWidth={2.5} /> : <Check size={20} strokeWidth={2.5} />}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAddingNew(false);
              setNewBrandName('');
            }}
            className="h-[44px] sm:h-[46px] w-[44px] sm:w-[46px] flex items-center justify-center bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-all shrink-0 active:scale-95 border border-gray-200 dark:border-slate-700"
            title="Cancel"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
}