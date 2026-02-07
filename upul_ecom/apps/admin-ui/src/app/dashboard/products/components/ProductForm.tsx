"use client";

import { useState, useEffect } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import ParentSelector from "./../category/components/ParentSelector";
// 👇 IMPORT THE REFINED BRAND SELECTOR
import BrandSelector from "./../brand/components/BrandSelector";
import ImageUploader from "./../../products/imagekit/components/ImageUploader";
import StockManager from "./../stockmanager/components/StockManager";
import ColorSelector from "./../colorselector/ColorSelector";
import { uploadImageToKit } from "./../imagekit/utils/uploadService";
import {
  Loader2,
  Eye,
  EyeOff,
  Tag,
  Image as ImageIcon,
  Box,
  Layers,
  DollarSign,
  X,
} from "lucide-react";

// ... [TYPES and INITIAL_DATA remain exactly the same] ...
interface ProductImage {
  fileId: string;
  url: string;
}
interface Variant {
  size: string;
  stock: number;
}
export interface ProductFormValues {
  name: string;
  sku?: string;
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
  visible?: boolean;
}

interface Props {
  initialData?: ProductFormValues;
  onSubmit: (data: ProductFormValues) => Promise<void>;
  isLoading: boolean;
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
  visible: true,
};

export default function ProductForm({
  initialData,
  onSubmit,
  isLoading,
}: Props) {
  const isEditMode = !!initialData;
  const [resetKey, setResetKey] = useState(0);
  const [selectedRawFiles, setSelectedRawFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [hasVariants, setHasVariants] = useState(false);
  const MAX_IMAGES = 5;

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

  // Watchers
  const watchedName = watch("name");
  const watchedColors = watch("colors");
  const watchedPrice = watch("price");
  const watchedDiscountType = watch("discountType");
  const watchedDiscountValue = watch("discountValue");
  const currentImages = watch("images") || [];

  // 🧠 LOGIC: NAME PREVIEW (Single Color)
  const primaryColor = watchedColors?.[0] || "";
  const namePreview =
    primaryColor &&
    !watchedName?.toLowerCase().includes(primaryColor.toLowerCase())
      ? `${watchedName} ${primaryColor}`
      : watchedName;

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      if (initialData.variants?.length > 0) setHasVariants(true);
      if (initialData.visible !== undefined)
        setValue("visible", initialData.visible);
    }
  }, [initialData, reset, setValue]);

  const getDiscountedPrice = () => {
    const price = Number(watchedPrice) || 0;
    const val = Number(watchedDiscountValue) || 0;
    if (watchedDiscountType === "PERCENTAGE")
      return price - price * (val / 100);
    if (watchedDiscountType === "FIXED") return price - val;
    return price;
  };

  const onFormSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    // ... [Validation Logic Remains Same] ...
    if (!data.categoryId) {
      alert("Please select a category");
      return;
    }
    const totalImages = currentImages.length + selectedRawFiles.length;
    if (totalImages > MAX_IMAGES) {
      alert(`Max ${MAX_IMAGES} images allowed.`);
      return;
    }
    if (hasVariants && data.variants.length === 0) {
      alert("Add size variants.");
      return;
    }
    if (!hasVariants && Number(data.stock) < 0) {
      alert("Stock cannot be negative.");
      return;
    }

    try {
      setIsUploading(true);

      // 1. Upload Images
      let newUploadedImages: ProductImage[] = [];
      if (selectedRawFiles.length > 0) {
        const uploadPromises = selectedRawFiles.map((file) =>
          uploadImageToKit(file),
        );
        newUploadedImages = await Promise.all(uploadPromises);
      }
      const finalImages = [...currentImages, ...newUploadedImages];

      // 2. Prepare Payload
      const cleanData = { ...data };
      cleanData.images = finalImages;

      // 🧠 LOGIC: Append Color to Name
      if (cleanData.colors?.length > 0) {
        const colorToAppend = cleanData.colors[0];
        if (
          !cleanData.name.toLowerCase().includes(colorToAppend.toLowerCase())
        ) {
          cleanData.name = `${cleanData.name} ${colorToAppend}`.trim();
        }
      }

      if (hasVariants) {
        cleanData.stock = cleanData.variants.reduce(
          (acc, curr) => acc + Number(curr.stock),
          0,
        );
      } else {
        cleanData.variants = [];
        cleanData.sizeType = "One Size";
        cleanData.stock = Number(data.stock) || 0;
      }

      await onSubmit(cleanData);
    } catch (error) {
      console.error("Save failed", error);
      alert("Failed to save product.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeExistingImage = (index: number) => {
    const updated = [...currentImages];
    updated.splice(index, 1);
    setValue("images", updated);
  };

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20"
    >
      {/* LEFT COLUMN */}
      <div className="lg:col-span-2 space-y-6">
        {/* --- 1. GENERAL INFORMATION (Refined UI) --- */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Tag size={20} className="text-blue-600" /> General Information
          </h2>

          <div className="space-y-6">
            {/* Name Input */}
            <div>
              <label className="label">Product Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Cotton Night Dress"
                {...register("name", { required: true })}
              />
              {/* Dynamic Name Preview */}
              {primaryColor && watchedName && (
                <div className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg flex items-center gap-2 animate-in fade-in">
                  <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Auto-Preview
                  </span>
                  <span>
                    Final Name: <strong>{namePreview}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="label">Description</label>
              <textarea
                {...register("description")}
                rows={4}
                className="input-field resize-none leading-relaxed min-h-[120px]"
                placeholder="Write a compelling description for your product..."
              />
            </div>

            {/* SKU & Brand Grid - Perfectly Aligned */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* SKU - System Generated (Always Locked) */}
              <div className="w-full">
                <label className="label flex justify-between items-center">
                  SKU
                  <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                    Auto-Generated
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register("sku")}
                    disabled={true} // 🔒 FORCE DISABLED ALWAYS
                    className="input-field h-[46px] bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-500 cursor-not-allowed italic border-dashed"
                    placeholder="System will generate this..."
                  />
                  {/* Lock Icon Overlay */}
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="3"
                        y="11"
                        width="18"
                        height="11"
                        rx="2"
                        ry="2"
                      ></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                </div>
              </div>
              {/* Brand Selector Column */}
              <div className="w-full">
                <label className="label">Brand</label>
                <Controller
                  name="brand"
                  control={control}
                  render={({ field }) => (
                    <BrandSelector
                      selectedBrand={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- 2. COLORS & SIZE --- */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Layers size={20} className="text-purple-600" /> Color & Size
            </h2>
            {/* Toggle Logic */}
            <label className="flex items-center gap-2 cursor-pointer bg-gray-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-slate-700 transition hover:bg-gray-100 dark:hover:bg-slate-700">
              <input
                type="checkbox"
                checked={hasVariants}
                onChange={(e) => setHasVariants(e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300 select-none">
                Has Sizes?
              </span>
            </label>
          </div>

          <div className="space-y-6">
            {/* Single Color Logic */}
            <div className="p-5 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800">
              <label className="label mb-3 block">
                Primary Color <span className="text-red-500">*</span>
              </label>
              <Controller
                name="colors"
                control={control}
                render={({ field }) => (
                  <ColorSelector
                    key={`color-${resetKey}`}
                    selectedColor={field.value?.[0] || ""}
                    onChange={(colorName) =>
                      // Enforce Single Color Array
                      field.onChange(colorName ? [colorName] : [])
                    }
                  />
                )}
              />
            </div>

            <hr className="border-gray-100 dark:border-slate-800" />

            {/* Stock Logic */}
            {hasVariants ? (
              <StockManager
                key={`stock-${resetKey}`}
                initialVariants={initialData?.variants}
                initialSizeType={initialData?.sizeType}
                onUpdate={(data) => {
                  setValue("sizeType", data.sizeType);
                  setValue("variants", data.variants);
                }}
              />
            ) : (
              <div>
                <label className="label">Stock Quantity</label>
                <input
                  type="number"
                  className="input-field w-40 font-mono text-lg"
                  {...register("stock", {
                    required: !hasVariants,
                    min: 0,
                    valueAsNumber: true,
                  })}
                />
              </div>
            )}
          </div>
        </div>

        {/* --- 3. PRICING --- */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <DollarSign size={20} className="text-emerald-600" /> Pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Base Price (LKR)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                  Rs.
                </span>
                <input
                  type="number"
                  {...register("price", { required: true })}
                  className="input-field pl-12 font-bold text-lg text-gray-900 dark:text-white"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
              <div className="flex gap-3 mb-3">
                <div className="w-1/2">
                  <label className="label text-emerald-800 dark:text-emerald-400 text-xs uppercase tracking-wide">
                    Discount
                  </label>
                  <select
                    {...register("discountType")}
                    className="input-field text-sm py-2"
                  >
                    <option value="NONE">None</option>
                    <option value="PERCENTAGE">% Off</option>
                    <option value="FIXED">Fixed Amount</option>
                  </select>
                </div>
                {watchedDiscountType !== "NONE" && (
                  <div className="w-1/2">
                    <label className="label text-emerald-800 dark:text-emerald-400 text-xs uppercase tracking-wide">
                      Value
                    </label>
                    <input
                      type="number"
                      {...register("discountValue")}
                      className="input-field text-sm py-2"
                      placeholder={
                        watchedDiscountType === "PERCENTAGE" ? "10" : "500"
                      }
                    />
                  </div>
                )}
              </div>

              {watchedDiscountType !== "NONE" && (
                <div className="flex justify-between items-center pt-3 border-t border-emerald-200 dark:border-emerald-800/50">
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    Customer Price:
                  </span>
                  <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                    Rs. {getDiscountedPrice().toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="space-y-6">
        {/* --- 4. IMAGES --- */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ImageIcon size={20} className="text-orange-500" /> Media
            </h2>
            <span
              className={`text-xs font-bold px-2 py-1 rounded-md ${currentImages.length + selectedRawFiles.length >= MAX_IMAGES ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400"}`}
            >
              {currentImages.length + selectedRawFiles.length}/{MAX_IMAGES}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {currentImages.map((img, idx) => (
              <div
                key={`old-${idx}`}
                className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 group"
              >
                <img
                  src={img.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(idx)}
                  className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition hover:bg-red-50"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {selectedRawFiles.map((file, idx) => (
              <div
                key={`new-${idx}`}
                className="relative aspect-square rounded-xl overflow-hidden border-2 border-blue-100 dark:border-blue-900 group"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt=""
                  className="w-full h-full object-cover opacity-90"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = [...selectedRawFiles];
                    updated.splice(idx, 1);
                    setSelectedRawFiles(updated);
                  }}
                  className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition hover:bg-red-50"
                >
                  <X size={12} />
                </button>
                <div className="absolute bottom-0 w-full bg-blue-500 text-white text-[9px] font-bold text-center py-0.5">
                  NEW
                </div>
              </div>
            ))}
          </div>

          {currentImages.length + selectedRawFiles.length < MAX_IMAGES ? (
            <ImageUploader
              key={`uploader-${resetKey}`}
              onFilesSelected={(incomingFiles) => {
                const currentTotal =
                  currentImages.length + selectedRawFiles.length;
                const slotsLeft = MAX_IMAGES - currentTotal;
                if (slotsLeft <= 0) return alert("Limit reached");
                setSelectedRawFiles((prev) => [
                  ...prev,
                  ...incomingFiles.slice(0, slotsLeft),
                ]);
                setResetKey((p) => p + 1);
              }}
            />
          ) : (
            <div className="text-center p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-xs text-gray-500">
              Max images reached.
            </div>
          )}
        </div>

        {/* --- 5. CATEGORY --- */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Box size={20} className="text-pink-500" /> Category
          </h2>
          <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700">
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <ParentSelector
                  key={`cat-${resetKey}`}
                  refreshTrigger={0}
                  initialCategoryId={initialData?.categoryId}
                  onSelectionChange={(id) => field.onChange(id || "")}
                />
              )}
            />
          </div>
        </div>

        {/* --- 6. ACTIONS --- */}
        <div className="sticky top-6 space-y-4">
          {isEditMode && (
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
              <label className="label mb-2">Visibility</label>
              <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
                <Controller
                  name="visible"
                  control={control}
                  defaultValue={initialData?.visible ?? true}
                  render={({ field }) => (
                    <>
                      <button
                        type="button"
                        onClick={() => field.onChange(true)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${field.value ? "bg-white dark:bg-slate-700 text-green-600 shadow-sm" : "text-gray-500 dark:text-slate-400 hover:text-gray-900"}`}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <Eye size={14} /> Live
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => field.onChange(false)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${!field.value ? "bg-white dark:bg-slate-700 text-amber-600 shadow-sm" : "text-gray-500 dark:text-slate-400 hover:text-gray-900"}`}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <EyeOff size={14} /> Draft
                        </div>
                      </button>
                    </>
                  )}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || isUploading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {(isUploading || isLoading) && (
              <Loader2 className="animate-spin" size={18} />
            )}
            {isUploading
              ? "Uploading..."
              : isLoading
                ? "Saving Product..."
                : isEditMode
                  ? "Update Product"
                  : "Publish Product"}
          </button>

          <button
            type="button"
            onClick={() => reset()}
            className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-500 dark:text-slate-400 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            Discard Changes
          </button>
        </div>
      </div>

      {/* Global Form Styles */}
      <style jsx global>{`
        .label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }
        .dark .label {
          color: #94a3b8;
        }

        .input-field {
          width: 100%;
          padding: 0.75rem 1rem;
          background-color: #f8f9fa;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          color: #1f2937;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }
        .dark .input-field {
          background-color: #1e293b;
          border-color: #334155;
          color: #f8fafc;
        }
        .input-field:focus {
          background-color: #ffffff;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
          outline: none;
        }
        .dark .input-field:focus {
          background-color: #0f172a;
          border-color: #60a5fa;
          box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.15);
        }
      `}</style>
    </form>
  );
}
