"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableCategoryItem } from "./components/SortableCategoryItem";
import { ArrowLeft, Home, Loader2, Plus, AlertCircle, Save, X } from "lucide-react"; // 👈 Added Icons
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axiosInstance";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  sortOrder: number;
  _count?: { subCategories: number }; // or children
}

export default function CategoryManager() {
  const queryClient = useQueryClient();
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Navigation
  const [path, setPath] = useState<{id: string, name: string}[]>([]); 
  const currentParentId = path.length > 0 ? path[path.length - 1].id : null;

  // Input State
  const [inputValue, setInputValue] = useState("");
  // 👇 NEW: Track which item we are editing (null = creating new)
  const [editingItem, setEditingItem] = useState<Category | null>(null);

  // --- 1. FETCH ---
  const { data: serverData, isLoading } = useQuery({
    queryKey: ['categories', currentParentId || 'root'],
    queryFn: async () => {
      const params = currentParentId ? { parentId: currentParentId } : { roots: 'true' };
      const config = { params: { ...params, _t: new Date().getTime() } };
      const { data } = await axiosInstance.get('/api/categories', config);
      return (data || []).sort((a: Category, b: Category) => a.sortOrder - b.sortOrder);
    },
  });

  useEffect(() => {
    if (serverData) setCategories(serverData);
  }, [serverData]);

  // --- 2. CREATE MUTATION ---
  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      return axiosInstance.post('/api/categories', {
        name,
        parentId: currentParentId,
        sortOrder: categories.length
      });
    },
    onSuccess: (res) => {
      toast.success("Category added");
      setInputValue("");
      // Optimistic add (optional, but good)
      if (res.data) setCategories(prev => [...prev, res.data]);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories-selector'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed")
  });

  // --- 3. UPDATE MUTATION (The Pencil Fix) ✏️ ---
  const updateMutation = useMutation({
    mutationFn: async (payload: { id: string, name: string }) => {
      // Assuming your backend supports PUT /categories/:id
      return axiosInstance.put(`/api/categories/${payload.id}`, { name: payload.name });
    },
    onSuccess: () => {
      toast.success("Category renamed");
      setInputValue("");
      setEditingItem(null); // Exit edit mode
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories-selector'] });
    },
    onError: () => toast.error("Failed to rename")
  });

  // --- 4. DELETE MUTATION ---
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => axiosInstance.delete(`/api/categories/${id}`),
    onSuccess: () => {
      toast.success("Deleted");
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories-selector'] });
    },
    onError: () => toast.error("Failed to delete")
  });

  // --- 5. REORDER MUTATION ---
  const reorderMutation = useMutation({
    mutationFn: async (items: { id: string; sortOrder: number }[]) => {
      return axiosInstance.put('/api/categories/reorder', { items });
    },
    onError: () => {
      toast.error("Reorder failed");
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });

  // --- HANDLERS ---
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setCategories((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        const updates = newItems.map((item, index) => ({ id: item.id, sortOrder: index }));
        reorderMutation.mutate(updates);
        return newItems;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (editingItem) {
      // Update Mode
      updateMutation.mutate({ id: editingItem.id, name: inputValue });
    } else {
      // Create Mode
      createMutation.mutate(inputValue);
    }
  };

  // 👇 The "Pencil" Click Handler
  const handleEditClick = (cat: Category) => {
    setEditingItem(cat);
    setInputValue(cat.name);
    // Optional: Focus the input (requires a ref, simplest is just state update)
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setInputValue("");
  };

  // DND Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // --- RENDER ---
  return (
    <div className="max-w-3xl mx-auto p-8">
      
      {/* Header & Breadcrumbs */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 shadow-sm">
        <button onClick={() => setPath([])} className="hover:text-blue-600 flex items-center gap-1 font-medium">
          <Home size={16} /> Home
        </button>
        {path.map((crumb, idx) => (
          <div key={crumb.id} className="flex items-center gap-2">
            <span className="text-gray-300">/</span>
            <button 
              onClick={() => setPath(prev => prev.slice(0, idx + 1))}
              className={`${idx === path.length - 1 ? "font-bold text-black" : "hover:text-blue-600"}`}
            >
              {crumb.name}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            {currentParentId ? `📂 ${path[path.length-1].name}` : "🗂️ Root Categories"}
          </h1>
          {currentParentId && (
            <button 
              onClick={() => setPath(prev => prev.slice(0, -1))}
              className="text-xs flex items-center gap-1 text-gray-500 hover:text-black transition px-2 py-1 rounded hover:bg-gray-200"
            >
              <ArrowLeft size={14} /> Back
            </button>
          )}
        </div>

        {/* List */}
        <div className="p-6 min-h-[300px]">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-400" /></div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                {categories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
                    <AlertCircle className="mb-2 opacity-50" />
                    <p>No sub-categories here yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <SortableCategoryItem 
                        key={cat.id} 
                        category={cat}
                        onDrillDown={(c) => setPath(prev => [...prev, { id: c.id, name: c.name }])}
                        onEdit={handleEditClick} // 👈 Connects the pencil!
                        onDelete={(id) => { if(confirm("Delete?")) deleteMutation.mutate(id); }}
                      />
                    ))}
                  </div>
                )}
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Footer: Create / Edit Form */}
        <form onSubmit={handleSubmit} className={`p-4 border-t flex gap-3 transition-colors ${editingItem ? "bg-amber-50" : "bg-gray-50"}`}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={editingItem ? `Rename "${editingItem.name}"...` : `Add new inside "${currentParentId ? path[path.length-1].name : 'Home'}"...`}
            className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all
              ${editingItem ? "border-amber-300 focus:ring-amber-200" : "border-gray-300 focus:ring-black/5"}`}
          />
          
          {editingItem ? (
            <>
              <button 
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-amber-500 text-white px-6 rounded-lg font-medium hover:bg-amber-600 transition flex items-center gap-2"
              >
                {updateMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Update
              </button>
              <button 
                type="button" 
                onClick={handleCancelEdit}
                className="bg-gray-200 text-gray-600 px-4 rounded-lg hover:bg-gray-300 transition"
              >
                <X size={20} />
              </button>
            </>
          ) : (
            <button 
              type="submit"
              disabled={createMutation.isPending || !inputValue}
              className="bg-black text-white px-6 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition flex items-center gap-2"
            >
              {createMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              Add
            </button>
          )}
        </form>
      </div>
    </div>
  );
}