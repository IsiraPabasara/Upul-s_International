"use client";

import { useState, useEffect } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axiosInstance";
import ParentSelector from "../category/components/ParentSelector";
import BrandSelector from "../brand/components/BrandSelector";
import ImageUploader from "../../products/imagekit/components/ImageUploader";
import StockManager from "../stockmanager/components/StockManager";
import ColorSelector from "../colorselector/ColorSelector";
import { uploadImageToKit } from "../imagekit/utils/uploadService";

interface ProductImage {
  fileId: string;
  url: string;
}

interface Variant {
  size: string;
  stock: number;
}

interface ProductFormValues {
  name: string;
  description: string;
  price: number;
  stock: number;
  brand: string;
  categoryId: string;
  sizeType: string;
  variants: Variant[];
  colors: string[];
  images: ProductImage[];
  isNewArrival: boolean;
  discountType: "NONE" | "PERCENTAGE" | "FIXED";
  discountValue: number;
}

const INITIAL_DATA: ProductFormValues = {
  name: "",
  description: "",
  price: 0,
  stock: 0,
  brand: "",
  categoryId: "",
  sizeType: "Standard",
  variants: [],
  colors: [],
  images: [],
  isNewArrival: true,
  discountType: "NONE",
  discountValue: 0,
};

export default function AddProductPage() {
  const [baseName, setBaseName] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedRawFiles, setSelectedRawFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    defaultValues: INITIAL_DATA,
  });

  const watchedColors = watch("colors");
  const watchedPrice = watch("price");
  const watchedDiscountType = watch("discountType");
  const watchedDiscountValue = watch("discountValue");
  const currentName = watch("name");

  // --- MUTATION ---
  const mutation = useMutation({
    mutationFn: async (newProduct: ProductFormValues) => {
      const { data } = await axiosInstance.post("/api/products", newProduct);
      return data;
    },
    onSuccess: () => {
      // 1. Show success message
      setShowSuccess(true);

      // 2. Reset Form Data
      reset(INITIAL_DATA);
      setBaseName("");
      setResetKey((prev) => prev + 1); // Force re-render of complex children

      // 3. Hide message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    },
  });

  // --- LOGIC: NAME GENERATION ---
  // Only update if colors exist. If colors is empty, name = baseName.
  useEffect(() => {
    if (watchedColors && watchedColors.length > 0) {
      setValue("name", `${baseName} - ${watchedColors[0]}`);
    } else {
      setValue("name", baseName);
    }
  }, [watchedColors, baseName, setValue]);

  // --- LOGIC: DISCOUNT CALCULATOR ---
  const getDiscountedPrice = () => {
    const price = Number(watchedPrice) || 0;
    const val = Number(watchedDiscountValue) || 0;
    if (watchedDiscountType === "PERCENTAGE")
      return price - price * (val / 100);
    if (watchedDiscountType === "FIXED") return price - val;
    return price;
  };

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    if (!data.categoryId) {
      alert("Please select a category");
      return;
    }

    try {
      setIsUploading(true);
      let finalImages: ProductImage[] = [];

      if (selectedRawFiles.length > 0) {
        const uploadPromises = selectedRawFiles.map((file) =>
          uploadImageToKit(file),
        );
        const uploadedResults = await Promise.all(uploadPromises);
        finalImages = uploadedResults;
      }

      const productData = {
        ...data,
        images: finalImages,
      };

      mutation.mutate(productData);
    } catch (error) {
      console.error("Upload or Save failed", error);
      alert("Failed to upload images. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Add New Product</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-xl shadow-sm space-y-8"
      >
        {/* BASIC DETAILS */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">
            Basic Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Product Name</label>
              <input
                type="text"
                className="input-field"
                value={baseName}
                onChange={(e) => setBaseName(e.target.value)}
                required
                placeholder="e.g. Night Dress"
              />
              {/* 1. SAVED AS LOGIC: Only show if Color is selected */}
              <p className="text-xs text-gray-400 mt-1 h-4">
                {watchedColors && watchedColors.length > 0 && (
                  <>
                    Saved as:{" "}
                    <span className="font-medium text-gray-600">
                      {currentName}
                    </span>
                  </>
                )}
              </p>
            </div>
            <div>
              <label className="label">SKU</label>
              <div className="p-3 bg-gray-100 border border-gray-300 rounded-md text-gray-500 text-sm select-none">
                🔒 Auto-generated by System
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Controller
              name="colors"
              control={control}
              render={({ field }) => (
                <ColorSelector
                  key={`color-${resetKey}`}
                  selectedColor={field.value[0] || ""}
                  onChange={(colorName) =>
                    field.onChange(colorName ? [colorName] : [])
                  }
                  disabled={!baseName || baseName.trim() === ""}
                />
              )}
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              {...register("description", { required: true })}
              rows={3}
              className="input-field"
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">
              Media
            </h2>
            <ImageUploader
              key={`img-${resetKey}`}
              onFilesSelected={(files) => setSelectedRawFiles(files)}
            />
          </div>
        </div>

        {/* MARKETING & PRICING */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">
            Marketing & Pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="label">Original Price (LKR)</label>
                <input
                  type="number"
                  {...register("price", { required: true })}
                  className="input-field font-bold text-lg"
                />
              </div>
              <Controller
                name="brand"
                control={control}
                render={({ field }) => (
                  <BrandSelector
                    key={`brand-${resetKey}`}
                    selectedBrand={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  {...register("isNewArrival")}
                  className="w-5 h-5 accent-black"
                />
                <label className="font-medium text-gray-700">
                  Mark as New Arrival
                </label>
              </div>
              <hr className="border-orange-200" />
              <div>
                <label className="label text-orange-800">Discount Offer</label>
                <div className="flex gap-2">
                  <select
                    {...register("discountType")}
                    className="p-2 border rounded bg-white w-1/2 text-sm"
                  >
                    <option value="NONE">No Offer</option>
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (LKR)</option>
                  </select>
                  {watchedDiscountType !== "NONE" && (
                    <input
                      type="number"
                      {...register("discountValue")}
                      placeholder="Value"
                      className="p-2 border rounded w-1/2 text-sm"
                    />
                  )}
                </div>
              </div>
              {watchedDiscountType !== "NONE" && Number(watchedPrice) > 0 && (
                <div className="bg-white p-2 rounded border border-orange-200 text-sm text-center">
                  <span className="text-gray-400 line-through mr-2">
                    Rs. {watchedPrice}
                  </span>
                  <span className="font-bold text-green-600">
                    Now Rs. {getDiscountedPrice().toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CATEGORIZATION */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">
            Categorization
          </h2>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <ParentSelector
                  key={`cat-${resetKey}`}
                  refreshTrigger={0}
                  onSelectionChange={(id) => field.onChange(id || "")}
                />
              )}
            />
          </div>
        </div>

        {/* INVENTORY */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">
            Inventory & Variants
          </h2>
          <StockManager
            key={`stock-${resetKey}`}
            onUpdate={(data) => {
              setValue("sizeType", data.sizeType);
              setValue("variants", data.variants);
              setValue("stock", 0);
            }}
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={mutation.isPending || isUploading}
            className="w-full bg-black text-white py-4 rounded-lg text-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50"
          >
            {isUploading
              ? `Uploading ${selectedRawFiles.length} Images...`
              : mutation.isPending
                ? "Saving Product..."
                : "Publish Product"}
          </button>
        </div>

        {/* 4. SUCCESS MESSAGE LOGIC (Disappears automatically) */}
        {(showSuccess || mutation.isError) && (
          <div
            className={`p-4 text-center rounded-lg font-medium ${showSuccess ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
          >
            {showSuccess
              ? "✅ Product Created! Resetting form..."
              : `❌ Error: ${mutation.error?.message || "Something went wrong"}`}
          </div>
        )}
      </form>

      {/* CSS Styles */}
      <style jsx>{`
        .label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }
        .input-field {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-field:focus {
          border-color: #2563eb;
          ring: 2px;
          ring-color: #bfdbfe;
        }
      `}</style>
    </div>
  );
}
