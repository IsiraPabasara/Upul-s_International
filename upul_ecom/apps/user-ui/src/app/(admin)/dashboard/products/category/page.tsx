"use client";

import { useState } from "react";
import ParentSelector from "./components/ParentSelector";

export default function TestCategoryPage() {
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [parentId, setParentId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [refreshKey, setRefreshKey] = useState(0);

  // 1. CREATE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("http://localhost:4000/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, parentId, sortOrder }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setName("");
      setRefreshKey((prev) => prev + 1);
    } catch (err) { setStatus("error"); }
  };

  // 2. UPDATE (NEW)
  const handleUpdate = async () => {
    if (!parentId || !name) return;
    setStatus("loading");
    try {
      const res = await fetch(`http://localhost:4000/api/categories/${parentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, sortOrder }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setRefreshKey((prev) => prev + 1);
    } catch (err) { setStatus("error"); }
  };

  // 3. DELETE
  const handleDelete = async () => {
    if (!parentId || !confirm("Delete this and all sub-categories?")) return;
    setStatus("loading");
    try {
      const res = await fetch(`http://localhost:4000/api/categories/${parentId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setParentId(null);
      setRefreshKey((prev) => prev + 1);
    } catch (err) { setStatus("error"); }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🛠️ Category Manager</h1>

      <div className="bg-white p-6 shadow rounded-xl space-y-6">
        {/* INPUT SECTION */}
        <div className="space-y-4 border-b pb-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3">
              <label className="block text-xs text-gray-500 mb-1">Name</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="col-span-1">
              <label className="block text-xs text-gray-500 mb-1">Order</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Add Sub-category
            </button>
            
            {parentId && (
              <button
                onClick={handleUpdate}
                className="flex-1 bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 transition"
              >
                Update Selected
              </button>
            )}
          </div>
        </div>

        {/* BROWSE SECTION */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Browse & Select</h2>
            {parentId && (
              <button onClick={handleDelete} className="text-xs text-red-600 hover:underline">
                Delete Category
              </button>
            )}
          </div>

          <ParentSelector
            onSelectionChange={(id) => setParentId(id)}
            refreshTrigger={refreshKey}
          />
        </div>
      </div>
    </div>
  );
}