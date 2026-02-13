'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/app/utils/axiosInstance';
import { Trash2, Loader2, Tag, Calendar, User, Globe, Lock } from 'lucide-react';

export default function AdminCouponsPage() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    type: 'PERCENTAGE',
    value: '',
    minOrderAmount: '0',
    limitPerUser: '1', // Default 1 for "One time use"
    maxUses: '',
    expiresAt: '',
    isPublic: true
  });

  // Fetch Coupons
  const { data: coupons, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => (await axiosInstance.get('/api/coupons')).data
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => await axiosInstance.post('/api/coupons', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setIsCreating(false);
      setFormData({ ...formData, code: '', value: '' }); // Reset partial
      alert("Coupon Created!");
    },
    onError: (err: any) => alert(err.response?.data?.message || "Failed to create")
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await axiosInstance.delete(`/api/coupons/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  if (isLoading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Coupons</h1>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition"
        >
          {isCreating ? 'Cancel' : '+ New Coupon'}
        </button>
      </div>

      {/* --- CREATE FORM --- */}
      {isCreating && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
          <h2 className="text-lg font-bold mb-4">Create New Discount Code</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Row 1 */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
              <input 
                required 
                type="text" 
                placeholder="SUMMER2026"
                className="w-full border p-2 rounded-md uppercase font-mono tracking-wider"
                value={formData.code}
                onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 col-span-2 md:col-span-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select 
                  className="w-full border p-2 rounded-md"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                <input 
                  required type="number" 
                  className="w-full border p-2 rounded-md"
                  value={formData.value}
                  onChange={e => setFormData({...formData, value: e.target.value})}
                />
              </div>
            </div>

            {/* Row 2: Constraints */}
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Amount</label>
               <input 
                  type="number" 
                  className="w-full border p-2 rounded-md"
                  value={formData.minOrderAmount}
                  onChange={e => setFormData({...formData, minOrderAmount: e.target.value})}
               />
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
               <input 
                  type="date" 
                  className="w-full border p-2 rounded-md"
                  value={formData.expiresAt}
                  onChange={e => setFormData({...formData, expiresAt: e.target.value})}
               />
            </div>

            {/* Row 3: Limits */}
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Uses Per User (1 = One time)</label>
               <input 
                  type="number" 
                  className="w-full border p-2 rounded-md"
                  placeholder="Leave empty for unlimited"
                  value={formData.limitPerUser}
                  onChange={e => setFormData({...formData, limitPerUser: e.target.value})}
               />
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Total Global Uses</label>
               <input 
                  type="number" 
                  className="w-full border p-2 rounded-md"
                  placeholder="e.g. First 100 users"
                  value={formData.maxUses}
                  onChange={e => setFormData({...formData, maxUses: e.target.value})}
               />
            </div>

            {/* Row 4: Public/Private */}
            <div className="col-span-2 flex items-center gap-2">
              <input 
                type="checkbox" 
                id="isPublic"
                checked={formData.isPublic}
                onChange={e => setFormData({...formData, isPublic: e.target.checked})}
                className="w-4 h-4"
              />
              <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                Public Code (Guests can use without logging in)
              </label>
            </div>

            <div className="col-span-2">
              <button 
                disabled={createMutation.isPending}
                type="submit" 
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
              >
                {createMutation.isPending ? 'Saving...' : 'Create Coupon'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- LIST --- */}
      <div className="grid gap-4">
        {coupons?.map((coupon: any) => (
          <div key={coupon.id} className="bg-white p-5 rounded-lg border border-gray-200 flex flex-col md:flex-row justify-between items-center shadow-sm">
            <div className="flex items-start gap-4 mb-4 md:mb-0">
              <div className="bg-gray-100 p-3 rounded-md">
                <Tag className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 tracking-wide">{coupon.code}</h3>
                <p className="text-sm text-green-600 font-bold">
                  {coupon.type === 'PERCENTAGE' ? `${coupon.value}% OFF` : `-$${coupon.value} Discount`}
                </p>
                <div className="flex gap-3 text-xs text-gray-500 mt-1">
                   <span className="flex items-center gap-1"><User size={12}/> {coupon.limitPerUser ? `Limit: ${coupon.limitPerUser}/user` : 'Unlim. per user'}</span>
                   <span className="flex items-center gap-1">
                      {coupon.isPublic ? <Globe size={12}/> : <Lock size={12}/>} 
                      {coupon.isPublic ? 'Public' : 'Logged-in Only'}
                   </span>
                   {coupon.expiresAt && <span className="flex items-center gap-1"><Calendar size={12}/> Exp: {new Date(coupon.expiresAt).toLocaleDateString()}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500">Usage</p>
                <p className="text-lg font-bold">{coupon.usedCount} <span className="text-gray-400 text-sm">/ {coupon.maxUses || '∞'}</span></p>
              </div>
              <button 
                onClick={() => { if(confirm('Delete?')) deleteMutation.mutate(coupon.id) }}
                className="text-red-500 hover:bg-red-50 p-2 rounded-full transition"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
        {coupons?.length === 0 && <p className="text-center text-gray-500 mt-10">No coupons found.</p>}
      </div>
    </div>
  );
}