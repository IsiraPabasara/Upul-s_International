"use client";

import { useState, useEffect } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import ParentSelector from "./../category/components/ParentSelector";
import BrandSelector from "./../brand/components/BrandSelector";
import ImageUploader from "./../../products/imagekit/components/ImageUploader";
import StockManager from "./../stockmanager/components/StockManager";
import ColorSelector from "./../colorselector/ColorSelector";
import { uploadImageToKit } from "./../imagekit/utils/uploadService";
import {
  Loader2,
  Tag,
  Image as ImageIcon,
  Box,
  Layers,
  DollarSign,
  X,
  Minus,
  Plus,
  Eye,
  Zap,
} from "lucide-react";

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
  const currentImages = watch("images") || [];

  // Logic: Auto-Preview Name
  const primaryColor = watchedColors?.[0] || "";
  const namePreview =
    primaryColor &&
    !watchedName?.toLowerCase().includes(primaryColor.toLowerCase())
      ? `${watchedName} ${primaryColor}`
      : watchedName;

  // Logic: Discount Calc
  const getDiscountedPrice = () => {
    const price = Number(watchedPrice) || 0;
    const val = Number(watch("discountValue")) || 0;
    if (watchedDiscountType === "PERCENTAGE")
      return price - price * (val / 100);
    if (watchedDiscountType === "FIXED") return price - val;
    return price;
  };

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      if (initialData.variants?.length > 0) setHasVariants(true);
    }
  }, [initialData, reset]);

  const onFormSubmit: SubmitHandler<ProductFormValues> = async (data) => {
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

      // Upload Logic
      let newUploadedImages: ProductImage[] = [];
      if (selectedRawFiles.length > 0) {
        const uploadPromises = selectedRawFiles.map((file) =>
          uploadImageToKit(file),
        );
        newUploadedImages = await Promise.all(uploadPromises);
      }
      const finalImages = [...currentImages, ...newUploadedImages];
      const cleanData = { ...data, images: finalImages };

      // Name Append Logic
      if (cleanData.colors?.length > 0) {
        const colorToAppend = cleanData.colors[0];
        if (
          !cleanData.name.toLowerCase().includes(colorToAppend.toLowerCase())
        ) {
          cleanData.name = `${cleanData.name} ${colorToAppend}`.trim();
        }
      }

      // Stock Logic
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
    <form onSubmit={handleSubmit(onFormSubmit)} className="pb-20">
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 items-start">
        {/* === LEFT COLUMN === */}
        <div className="xl:col-span-3 space-y-8">
          {/* 1. GENERAL INFORMATION */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100 dark:border-slate-800">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                <Tag size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  General Information
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-0.5">
                  Basic identification details.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="label mb-2 ml-1">Product Name</label>
                <input
                  type="text"
                  className="input-field h-[48px] font-medium"
                  placeholder="e.g. Cotton Night Dress"
                  {...register("name", { required: true })}
                />
                {primaryColor && watchedName && (
                  <div className="mt-3 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-4 py-3 rounded-xl border border-blue-100 dark:border-blue-800/30 flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                    <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded shadow-sm font-bold tracking-wide uppercase">
                      Preview
                    </span>
                    <span className="truncate opacity-90">
                      Will save as: <strong>{namePreview}</strong>
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="label mb-2 ml-1">Description</label>
                <textarea
                  {...register("description")}
                  rows={4}
                  className="input-field resize-none leading-relaxed py-3 min-h-[120px]"
                  placeholder="Product description..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="w-full">
                  <div className="flex justify-between items-center mb-2 ml-1 h-5">
                    <label className="label mb-0">SKU</label>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 select-none">
                      Auto-Generated
                    </span>
                  </div>
                  <input
                    type="text"
                    {...register("sku")}
                    disabled={true}
                    className="input-field h-[46px] bg-slate-50 dark:bg-slate-800/40 text-slate-500 cursor-not-allowed border-dashed"
                    placeholder="Generated after save..."
                  />
                </div>
                <div className="w-full">
                  <div className="flex justify-between items-center mb-2 ml-1 h-5">
                    <label className="label mb-0">Brand</label>
                  </div>
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

          {/* 2. VARIANTS */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-slate-800">
              <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                <Layers size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  Variants
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-0.5">
                  Manage colors and sizes.
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <label className="label mb-3 ml-1">
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
                        field.onChange(colorName ? [colorName] : [])
                      }
                    />
                  )}
                />
              </div>
              <div className="border-t border-gray-100 dark:border-slate-800" />

              <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-slate-800/40 rounded-2xl border border-gray-100 dark:border-slate-700">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    Multiple Sizes ?
                  </span>
                  <span className="text-xs text-gray-500 dark:text-slate-400">
                    Enable for S, M, L variants.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasVariants}
                    onChange={(e) => setHasVariants(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600 shadow-inner"></div>
                </label>
              </div>

              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
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
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col gap-1 w-full sm:w-auto">
                      <label className="label mb-0 text-gray-900 dark:text-white">
                        Available Quantity
                      </label>
                      <div
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border w-fit ${(watch("stock") || 0) > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"}`}
                      >
                        {(watch("stock") || 0) > 0
                          ? "In Stock"
                          : "Out of Stock"}
                      </div>
                    </div>
                    <div className="flex items-center bg-gray-50 dark:bg-slate-800 rounded-xl p-1 border border-gray-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() =>
                          setValue(
                            "stock",
                            Math.max(0, (Number(watch("stock")) || 0) - 1),
                          )
                        }
                        className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-700 text-gray-500 hover:text-red-500 rounded-lg shadow-sm"
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="number"
                        min="0"
                        onKeyDown={(e) =>
                          (e.key === "-" || e.key === "e") && e.preventDefault()
                        }
                        className="w-20 h-10 text-center bg-transparent border-none text-lg font-bold text-gray-900 dark:text-white focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="0"
                        {...register("stock", {
                          required: !hasVariants,
                          min: 0,
                          valueAsNumber: true,
                        })}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setValue("stock", (Number(watch("stock")) || 0) + 1)
                        }
                        className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-700 text-gray-500 hover:text-emerald-600 rounded-lg shadow-sm"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3. PRICING */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-2xl text-emerald-600 dark:text-emerald-400">
                <DollarSign size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Pricing
                </h2>
                <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">
                  Set price and discount rules.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <div>
                <label className="label mb-2 ml-1 text-gray-600 dark:text-slate-300">
                  Base Selling Price
                </label>
                <div className="relative group transition-all transform focus-within:scale-[1.01]">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl pointer-events-none group-focus-within:text-emerald-600 transition-colors">
                    Rs.
                  </div>
                  <input
                    type="number"
                    min="0"
                    onKeyDown={(e) =>
                      (e.key === "-" || e.key === "e") && e.preventDefault()
                    }
                    {...register("price", { required: true })}
                    className="w-full h-16 pl-14 pr-4 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 rounded-2xl text-2xl font-bold text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="sm:col-span-2">
                  <label className="label mb-2 ml-1">Discount Type</label>
                  <div className="relative">
                    <select
                      {...register("discountType")}
                      className="w-full h-[64px] px-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-gray-700 dark:text-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none cursor-pointer appearance-none shadow-sm transition-all"
                    >
                      <option value="NONE">No Discount</option>
                      <option value="PERCENTAGE">Percentage %</option>
                      <option value="FIXED">Fixed Amount</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </div>

                <div
                  className={`sm:col-span-1 transition-all duration-300 ${watchedDiscountType === "NONE" ? "opacity-40 pointer-events-none grayscale blur-[1px]" : "opacity-100"}`}
                >
                  <label className="label mb-2 ml-1">Value</label>
                  <div className="relative group">
                    {watchedDiscountType === "FIXED" && (
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm pointer-events-none transition-colors group-focus-within:text-emerald-600">
                        Rs.
                      </div>
                    )}
                    <input
                      type="number"
                      min="0"
                      onKeyDown={(e) =>
                        (e.key === "-" || e.key === "e") && e.preventDefault()
                      }
                      {...register("discountValue")}
                      disabled={watchedDiscountType === "NONE"}
                      className={`w-full h-[64px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-lg font-bold text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-sm
                                        ${watchedDiscountType === "FIXED" ? "pl-12 pr-4" : "pl-4 pr-10"}
                                    `}
                      placeholder="0"
                    />
                    {watchedDiscountType === "PERCENTAGE" && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs pointer-events-none transition-colors group-focus-within:text-emerald-600">
                        %
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-white dark:from-slate-800 dark:to-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                <div className="flex items-center gap-8 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Original
                    </span>
                    <span className="font-mono text-gray-600 dark:text-slate-300 font-medium">
                      Rs. {Number(watchedPrice || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="h-8 w-px bg-gray-200 dark:bg-slate-700"></div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Discount
                    </span>
                    <span className="font-mono text-red-500 font-medium">
                      - Rs.{" "}
                      {(
                        Number(watchedPrice || 0) - getDiscountedPrice()
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-white dark:bg-slate-800 px-5 py-3 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm relative z-10">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Customer Price
                    </span>
                    <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none mt-0.5">
                      Rs. {getDiscountedPrice().toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === RIGHT COLUMN === */}
        <div className="xl:col-span-2 space-y-8 sticky top-6">
          {/* 4. MEDIA GALLERY */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ImageIcon size={20} className="text-orange-500" />
                Product Media
              </h2>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                  currentImages.length + selectedRawFiles.length >= MAX_IMAGES
                    ? "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:border-red-800"
                    : "bg-gray-100 text-gray-500 border-transparent dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {currentImages.length + selectedRawFiles.length} / {MAX_IMAGES}
              </span>
            </div>

            <div className="mb-4">
              {currentImages.length + selectedRawFiles.length > 0 ? (
                <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-sm bg-gray-50 dark:bg-slate-800 group">
                  <img
                    src={
                      currentImages[0]?.url ||
                      URL.createObjectURL(selectedRawFiles[0])
                    }
                    alt="Cover"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (currentImages.length > 0) removeExistingImage(0);
                      else {
                        const updated = [...selectedRawFiles];
                        updated.splice(0, 1);
                        setSelectedRawFiles(updated);
                      }
                    }}
                    className="absolute top-3 right-3 p-2 bg-white/90 text-red-500 hover:bg-red-500 hover:text-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-90 group-hover:scale-100 backdrop-blur-sm z-20"
                    title="Remove Cover"
                  >
                    <X size={18} />
                  </button>
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm z-10">
                    Cover Image
                  </div>
                </div>
              ) : (
                <div className="aspect-[4/5] w-full rounded-2xl bg-gray-50 dark:bg-slate-800/50 border-2 border-dashed border-gray-200 dark:border-slate-700 flex flex-col items-center justify-center gap-3 text-gray-400">
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-sm">
                    <ImageIcon
                      size={32}
                      strokeWidth={1.5}
                      className="opacity-50"
                    />
                  </div>
                  <span className="text-xs font-medium uppercase tracking-wide">
                    No cover image
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 gap-3 mb-4">
              {[...currentImages, ...selectedRawFiles].map((fileOrUrl, idx) => {
                if (idx === 0) return null;
                const src =
                  fileOrUrl instanceof File
                    ? URL.createObjectURL(fileOrUrl)
                    : (fileOrUrl as ProductImage).url;
                return (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all bg-gray-50 dark:bg-slate-800 group"
                  >
                    <img
                      src={src}
                      className="w-full h-full object-contain"
                      alt=""
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (idx < currentImages.length)
                          removeExistingImage(idx);
                        else {
                          const newIdx = idx - currentImages.length;
                          const upd = [...selectedRawFiles];
                          upd.splice(newIdx, 1);
                          setSelectedRawFiles(upd);
                        }
                      }}
                      className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white"
                    >
                      <div className="bg-white text-red-500 p-1.5 rounded-full shadow-sm">
                        <X size={14} />
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>

            {currentImages.length + selectedRawFiles.length < MAX_IMAGES ? (
              <ImageUploader
                onFilesSelected={(incoming) => {
                  const left =
                    MAX_IMAGES -
                    (currentImages.length + selectedRawFiles.length);
                  if (left <= 0) return;
                  setSelectedRawFiles((p) => [
                    ...p,
                    ...incoming.slice(0, left),
                  ]);
                }}
              />
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700 text-center">
                <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide">
                  Maximum limit reached
                </p>
              </div>
            )}
          </div>

          {/* 5. ORGANIZATION & STATUS */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-pink-50 dark:bg-pink-900/20 rounded-xl text-pink-500">
                <Box size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  Organization
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-0.5">
                  Category and status settings.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-slate-800/40 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <ParentSelector
                      refreshTrigger={0}
                      initialCategoryId={initialData?.categoryId}
                      onSelectionChange={(id) => field.onChange(id || "")}
                    />
                  )}
                />
              </div>

              {/* Status Toggles */}
              <div className="grid grid-cols-1 gap-3">
                {/* Visibility Toggle */}
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                      <Eye size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">Visible</span>
                      <span className="text-[10px] text-gray-500 font-medium">Public on store</span>
                    </div>
                  </div>
                  <Controller
                    name="visible"
                    control={control}
                    render={({ field }) => (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                        <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    )}
                  />
                </div>

                {/* New Arrival Toggle */}
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600">
                      <Zap size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">New Arrival</span>
                      <span className="text-[10px] text-gray-500 font-medium">Highlight badge</span>
                    </div>
                  </div>
                  <Controller
                    name="isNewArrival"
                    control={control}
                    render={({ field }) => (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                        <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                      </label>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="space-y-3 pt-4">
            <button
              type="submit"
              disabled={isLoading || isUploading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 flex justify-center items-center gap-2 active:scale-[0.98]"
            >
              {(isUploading || isLoading) && (
                <Loader2 className="animate-spin" size={18} />
              )}
              {isUploading
                ? "Uploading..."
                : isLoading
                  ? "Saving..."
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
      </div>

      <style jsx global>{`
        .label {
          display: block;
          font-size: 0.8rem;
          font-weight: 700;
          color: #4b5563;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .dark .label {
          color: #94a3b8;
        }
        .input-field {
          width: 100%;
          padding: 0.75rem 1rem;
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          color: #111827;
          font-size: 0.95rem;
          transition: all 0.2s;
        }
        .dark .input-field {
          background-color: #1e293b;
          border-color: #334155;
          color: #f8fafc;
        }
        .input-field:focus {
          background-color: #fff;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
          outline: none;
        }
        .dark .input-field:focus {
          background-color: #0f172a;
        }
      `}</style>
    </form>
  );
}