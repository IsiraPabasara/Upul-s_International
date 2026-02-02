"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axiosInstance";
import toast from "react-hot-toast";
import { Plus, X, Check } from "lucide-react";

interface Color {
  id: string;
  name: string;
  hexCode: string;
}

interface ColorSelectorProps {
  selectedColor: string;
  onChange: (colorName: string) => void;
  disabled?: boolean; 
}

export default function ColorSelector({
  selectedColor,
  onChange,
  disabled
}: ColorSelectorProps) {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newHex, setNewHex] = useState("#000000");

  // 1. Fetch colors using useQuery
  const { data: colors = [], isLoading } = useQuery<Color[]>({
    queryKey: ["colors"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/colors", { isPublic: true });
      return res.data;
    },
  });

  // 2. Add color using useMutation
  const addColorMutation = useMutation({
    mutationFn: (newColor: { name: string; hexCode: string }) =>
      axiosInstance.post("/api/colors", newColor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["colors"] });
      setIsAdding(false);
      setNewName("");
      setNewHex("#000000");
      toast.success("Color added to palette");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to add color");
    },
  });

  const handleAddColor = (): void => {
    if (!newName.trim()) {
      toast.error("Please enter a color name");
      return;
    }
    addColorMutation.mutate({ name: newName, hexCode: newHex });
  };

  return (
    <div className={`space-y-3 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex justify-between items-center">
        <label className="text-sm font-semibold text-gray-800">
          Available Colors
        </label>
        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md transition ${
            isAdding
              ? "bg-red-50 text-red-600"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {isAdding ? (
            <>
              <X size={14} /> Cancel
            </>
          ) : (
            <>
              <Plus size={14} /> Add New
            </>
          )}
        </button>
      </div>

      {/* --- Inline Add Form --- */}
      {isAdding && (
        <div className="flex gap-2 items-center bg-gray-50 p-3 rounded-lg border border-gray-200 animate-fadeIn">
          <input
            type="color"
            value={newHex}
            onChange={(e) => setNewHex(e.target.value)}
            className="w-10 h-10 rounded-lg cursor-pointer border-2 border-white shadow-sm p-0"
          />
          <input
            type="text"
            placeholder="Color name (e.g. Navy Blue)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="text-sm p-2 border rounded-md w-full focus:ring-1 focus:ring-black outline-none"
          />
          <button
            type="button"
            onClick={handleAddColor}
            disabled={addColorMutation.isPending}
            className="bg-black text-white text-sm px-4 py-2 rounded-md hover:bg-gray-800 disabled:bg-gray-400 transition"
          >
            {addColorMutation.isPending ? "..." : "Save"}
          </button>
        </div>
      )}

      {/* --- Color Swatches --- */}
      <div className="flex flex-wrap gap-4">
        {isLoading ? (
          <p className="text-xs text-gray-400 animate-pulse">
            Loading palette...
          </p>
        ) : (
          colors.map((color) => {
            const isSelected = selectedColor === color.name;
            return (
              <div
                key={color.id}
                onClick={() => onChange(isSelected ? "" : color.name)}
                className={`
                  group cursor-pointer flex flex-col items-center gap-2 p-2 rounded-xl transition-all duration-200
                  ${isSelected ? "bg-gray-50 scale-105 shadow-sm" : "hover:bg-gray-50"}
                `}
              >
                <div
                  className="w-10 h-10 rounded-full border-2 shadow-inner flex items-center justify-center relative transition-transform"
                  style={{
                    backgroundColor: color.hexCode,
                    borderColor: isSelected ? "#000" : "#e5e7eb",
                  }}
                >
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-full">
                      <Check
                        size={18}
                        className={
                          parseInt(color.hexCode.replace("#", ""), 16) >
                          0xffffff / 2
                            ? "text-black"
                            : "text-white"
                        }
                      />
                    </div>
                  )}
                </div>
                <span
                  className={`text-[10px] uppercase tracking-wider font-medium ${isSelected ? "text-black font-bold" : "text-gray-500"}`}
                >
                  {color.name}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
