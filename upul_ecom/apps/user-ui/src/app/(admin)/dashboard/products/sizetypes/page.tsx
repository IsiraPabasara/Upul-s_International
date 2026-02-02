'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/app/utils/axiosInstance';
import toast from 'react-hot-toast';
import { Ruler, Plus, Trash2, Tag } from 'lucide-react';

interface SizeType {
  id: string;
  name: string;
  values: string[];
}

export default function SizeTypeManager() {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState('');
  const [newValueString, setNewValueString] = useState('');

  // 1. Fetching data with TanStack Query
  const { data: types = [], isLoading } = useQuery<SizeType[]>({
    queryKey: ['size-types'],
    queryFn: async () => {
      const res = await axiosInstance.get('/api/size-types', { isPublic: true });
      return res.data;
    },
  });

  // 2. Mutation for Creating Size Types
  const createMutation = useMutation({
    mutationFn: (newType: { name: string; values: string[] }) =>
      axiosInstance.post('/api/size-types', newType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['size-types'] });
      setNewName('');
      setNewValueString('');
      toast.success('New size standard created');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create');
    },
  });

  // 3. Mutation for Deleting
  const deleteMutation = useMutation({
    mutationFn: (id: string) => axiosInstance.delete(`/api/size-types/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['size-types'] });
      toast.success('Size type removed');
    },
  });

  const handleCreate = (e: React.FormEvent): void => {
    e.preventDefault();
    const valuesArray = newValueString
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v !== '');

    if (valuesArray.length === 0) {
      toast.error('Please add at least one value');
      return;
    }

    createMutation.mutate({ name: newName, values: valuesArray });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-black text-white rounded-xl">
          <Ruler size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Size Standards</h1>
          <p className="text-sm text-gray-500">Define measurement scales for your products</p>
        </div>
      </div>

      {/* --- Create Form --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-10">
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Standard Name</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition"
                placeholder="e.g. UK Men's Shoes"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Values (Separated by Commas)</label>
              <input
                value={newValueString}
                onChange={(e) => setNewValueString(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition"
                placeholder="7, 8, 9, 10, 11..."
                required
              />
            </div>
          </div>
          <button
            disabled={createMutation.isPending}
            className="flex items-center justify-center gap-2 bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition disabled:bg-gray-400 w-full md:w-auto"
          >
            <Plus size={18} />
            {createMutation.isPending ? 'Saving Standard...' : 'Create Size Type'}
          </button>
        </form>
      </div>

      {/* --- List View --- */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
           {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {types.map((type) => (
            <div key={type.id} className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-gray-400" />
                  <h3 className="font-bold text-lg text-gray-800">{type.name}</h3>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(type.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {type.values.map((val) => (
                  <span
                    key={val}
                    className="text-[11px] font-mono font-medium bg-gray-50 px-2.5 py-1 rounded-md text-gray-600 border border-gray-100"
                  >
                    {val}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}