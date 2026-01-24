'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/app//utils/axiosInstance'; // Adjust path
import toast from 'react-hot-toast';

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

  // 1. Fetch Brands using useQuery
  const { data: brands = [], isLoading } = useQuery<Brand[]>({
    queryKey: ['brands'],
    queryFn: async () => {
      const res = await axiosInstance.get('/api/brands', { isPublic: true });
      return res.data;
    },
  });

  // 2. Create Brand using useMutation
  const createBrandMutation = useMutation({
    mutationFn: (name: string) => axiosInstance.post('/api/brands', { name }),
    onSuccess: (response) => {
      const newBrand = response.data;
      
      // Invalidate and refetch brands list
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      
      // Select the newly created brand
      onChange(newBrand.name);
      
      // Reset UI
      setIsAddingNew(false);
      setNewBrandName('');
      toast.success('Brand added!');
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || "Brand might already exist!";
      toast.error(message);
    },
  });

  const handleCreateBrand = () => {
    if (!newBrandName.trim()) return;
    createBrandMutation.mutate(newBrandName);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Brand</label>
      
      {!isAddingNew ? (
        <div className="flex gap-2">
          <select
            className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-blue-500 disabled:bg-gray-50"
            value={selectedBrand}
            onChange={(e) => onChange(e.target.value)}
            disabled={isLoading}
          >
            <option value="">{isLoading ? 'Loading brands...' : '-- Select Brand --'}</option>
            {brands
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((brand) => (
                <option key={brand.id} value={brand.name}>
                  {brand.name}
                </option>
              ))}
          </select>
          
          <button
            type="button"
            onClick={() => setIsAddingNew(true)}
            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 text-sm whitespace-nowrap"
          >
            + New
          </button>
        </div>
      ) : (
        <div className="flex gap-2 animate-fadeIn">
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500"
            placeholder="Enter brand name..."
            value={newBrandName}
            onChange={(e) => setNewBrandName(e.target.value)}
            autoFocus
          />
          <button
            type="button"
            onClick={handleCreateBrand}
            disabled={createBrandMutation.isPending}
            className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:opacity-50"
          >
            {createBrandMutation.isPending ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => setIsAddingNew(false)}
            className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 text-sm"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}