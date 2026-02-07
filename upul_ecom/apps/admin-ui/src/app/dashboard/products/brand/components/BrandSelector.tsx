'use client';

import { useState } from 'react';
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
      toast.success('Brand added!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Brand already exists");
    },
  });

  const handleCreateBrand = () => {
    if (!newBrandName.trim()) return;
    createBrandMutation.mutate(newBrandName);
  };

  // Common Input Style (Matches your ProductForm)
  const baseInputStyles = "w-full h-[46px] px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400";

  return (
    <div className="w-full">
      {!isAddingNew ? (
        <div className="flex gap-2">
          {/* Dropdown Wrapper */}
          <div className="relative w-full">
            <select
              className={`${baseInputStyles} appearance-none cursor-pointer`}
              value={selectedBrand}
              onChange={(e) => onChange(e.target.value)}
              disabled={isLoading}
            >
              <option value="">{isLoading ? 'Loading brands...' : 'Select a Brand'}</option>
              {brands
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((brand) => (
                  <option key={brand.id} value={brand.name}>
                    {brand.name}
                  </option>
                ))}
            </select>
            
            {/* Custom Arrow Icon */}
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
              <ChevronDown size={16} />
            </div>
          </div>
          
          {/* Add Button */}
          <button
            type="button"
            onClick={() => setIsAddingNew(true)}
            className="h-[46px] w-[46px] flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors shrink-0"
            title="Add New Brand"
          >
            <Plus size={20} />
          </button>
        </div>
      ) : (
        /* Add Mode */
        <div className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
          <input
            type="text"
            className={baseInputStyles}
            placeholder="Brand Name..."
            value={newBrandName}
            onChange={(e) => setNewBrandName(e.target.value)}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateBrand())}
          />
          <button
            type="button"
            onClick={handleCreateBrand}
            disabled={createBrandMutation.isPending}
            className="h-[46px] w-[46px] flex items-center justify-center bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 shrink-0 shadow-sm shadow-emerald-500/20"
          >
            {createBrandMutation.isPending ? <Loader2 className="animate-spin" size={20}/> : <Check size={20} />}
          </button>
          <button
            type="button"
            onClick={() => setIsAddingNew(false)}
            className="h-[46px] w-[46px] flex items-center justify-center bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
}