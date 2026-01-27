"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, Folder, ChevronRight } from "lucide-react";

interface Category {
  id: string;
  name: string;
  sortOrder: number;
  _count?: { subCategories: number }; // Optional: Show if it has children
}

interface Props {
  category: Category;
  onDrillDown: (cat: Category) => void;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
}

export function SortableCategoryItem({ category, onDrillDown, onEdit, onDelete }: Props) {
  // 1. Hook into DND Kit
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  // 2. Dynamic Styles for Dragging
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 mb-2 bg-white border rounded-lg shadow-sm hover:shadow-md transition-all ${isDragging ? "ring-2 ring-blue-500" : "border-gray-200"}`}
    >
      {/* LEFT: Drag Handle & Name */}
      <div className="flex items-center gap-3 flex-1">
        {/* Drag Handle - Only this part initiates drag */}
        <button
          {...attributes}
          {...listeners}
          className="p-1 text-gray-400 hover:text-gray-700 cursor-grab active:cursor-grabbing"
        >
          <GripVertical size={20} />
        </button>

        {/* Drill Down Button (The Name) */}
        <button 
          onClick={() => onDrillDown(category)}
          className="flex items-center gap-2 text-left font-medium text-gray-700 hover:text-blue-600 transition-colors group"
        >
          <Folder size={18} className="text-blue-200 group-hover:text-blue-500 fill-current" />
          {category.name}
          {/* Optional: Count Badge */}
          {category._count && category._count.subCategories > 0 && (
             <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
               {category._count.subCategories}
             </span>
          )}
        </button>
      </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(category)}
          className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded transition"
          title="Rename"
        >
          <Pencil size={16} />
        </button>
        
        <button
          onClick={() => onDelete(category.id)}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>

        {/* Arrow indicating you can go inside */}
        <button 
          onClick={() => onDrillDown(category)}
          className="p-1 text-gray-300 hover:text-blue-500"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}