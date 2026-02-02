"use client";

import { useState, useEffect } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import ParentSelector from "./../category/components/ParentSelector";
import BrandSelector from "./../brand/components/BrandSelector";
import ImageUploader from "./../../products/imagekit/components/ImageUploader";
import StockManager from "./../stockmanager/components/StockManager";
import ColorSelector from "./../colorselector/ColorSelector";
import { uploadImageToKit } from "./../imagekit/utils/uploadService";
import { Loader2, Eye, EyeOff } from "lucide-react";

// --- TYPES ---
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
  category?: { name: string; id: string };
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
  initialData?: ProductFormValues; // If passed, we are in EDIT mode
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
  visible: false,
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

  // --- HYDRATION (Load Data) ---
  useEffect(() => {
    if (initialData) {
      reset(initialData);
      // 2. Handle the "Has Variants" toggle
      if (initialData.variants && initialData.variants.length > 0) {
        setHasVariants(true);
      }

      // 3. Ensure visible field is set properly
      if (initialData.visible !== undefined) {
        setValue("visible", initialData.visible);
      }

      // 4. Debugging: Check if data is actually here
      console.log("Loaded Data:", initialData);
    }
  }, [initialData, reset]);

  // Watchers
  const watchedColors = watch("colors");
  const watchedPrice = watch("price");
  const watchedDiscountType = watch("discountType");
  const watchedDiscountValue = watch("discountValue");
  const currentImages = watch("images") || [];

  // Logic: Discount Preview
  const getDiscountedPrice = () => {
    const price = Number(watchedPrice) || 0;
    const val = Number(watchedDiscountValue) || 0;
    if (watchedDiscountType === "PERCENTAGE")
      return price - price * (val / 100);
    if (watchedDiscountType === "FIXED") return price - val;
    return price;
  };

  // Logic: Form Submit
  const onFormSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    if (!data.categoryId) {
      alert("Please select a category");
      return;
    }

    const totalImages = currentImages.length + selectedRawFiles.length;
    if (totalImages > MAX_IMAGES) {
      alert(`You can only have a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    if (hasVariants && data.variants.length === 0) {
      alert("Please add at least one size variant.");
      return;
    }
    if (!hasVariants && Number(data.stock) < 0) {
      alert("Stock cannot be negative.");
      return;
    }

    try {
      setIsUploading(true);

      // 1. Upload NEW images
      let newUploadedImages: ProductImage[] = [];
      if (selectedRawFiles.length > 0) {
        const uploadPromises = selectedRawFiles.map((file) =>
          uploadImageToKit(file),
        );
        newUploadedImages = await Promise.all(uploadPromises);
      }

      // 2. Combine OLD images + NEW images
      const finalImages = [...currentImages, ...newUploadedImages];

      // 3. Prepare Payload
      const cleanData = { ...data };
      cleanData.images = finalImages;

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

      console.log("Submitting Payload:", cleanData);

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
      className="bg-white p-6 rounded-xl shadow-sm space-y-8"
    >
      {/* 1. BASIC DETAILS */}
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
              {...register("name", { required: true })}
            />
          </div>
          <div>
            <label className="label">SKU</label>
            <input
              type="text"
              {...register("sku")}
              className={`input-field ${isEditMode ? "bg-gray-100 text-gray-500" : ""}`}
              readOnly={isEditMode}
              placeholder={isEditMode ? "" : "Auto-generated"}
              disabled={!isEditMode}
            />
          </div>
        </div>

        <div className="pt-2">
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

        <div>
          <label className="label">Description</label>
          <textarea
            {...register("description")}
            rows={3}
            className="input-field"
          />
        </div>

        {/* MEDIA SECTION */}
        {/* MEDIA SECTION */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
             <h2 className="text-xl font-semibold text-gray-700">Media</h2>
             <span className={`text-xs font-medium ${currentImages.length + selectedRawFiles.length >= MAX_IMAGES ? 'text-red-500' : 'text-gray-400'}`}>
               {currentImages.length + selectedRawFiles.length} / {MAX_IMAGES} images
             </span>
          </div>

          {/* 1. PREVIEW GRID (Combined Old + New) */}
          <div className="grid grid-cols-5 gap-4 mb-4">
             
             {/* A. EXISTING IMAGES (From DB) */}
             {currentImages.map((img, idx) => (
                <div key={`old-${idx}`} className="relative group border rounded-lg overflow-hidden aspect-square bg-gray-50 h-10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="product" className="object-cover w-full h-full" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm"
                  >
                    ✕
                  </button>
                  <span className="absolute bottom-0 left-0 bg-black/50 text-white text-[10px] px-1 w-full text-center">Saved</span>
                </div>
             ))}

             {/* B. NEW IMAGES (Staged for Upload) */}
             {selectedRawFiles.map((file, idx) => (
                <div key={`new-${idx}`} className="relative group border-2 border-dashed border-blue-200 rounded-lg overflow-hidden aspect-square bg-blue-50">
                  {/* Create a temporary URL for preview */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={URL.createObjectURL(file)} alt="preview" className="object-cover w-full h-full opacity-90" />
                  <button
                    type="button"
                    onClick={() => {
                       // Remove from NEW array
                       const updated = [...selectedRawFiles];
                       updated.splice(idx, 1);
                       setSelectedRawFiles(updated);
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm"
                  >
                    ✕
                  </button>
                  <span className="absolute bottom-0 left-0 bg-blue-600 text-white text-[10px] px-1 w-full text-center">New</span>
                </div>
             ))}
          </div>

          {/* 2. UPLOADER (Conditionally Hidden) */}
          {currentImages.length + selectedRawFiles.length < MAX_IMAGES ? (
             <ImageUploader 
               key={`uploader-${resetKey}`} // 👈 FORCE RESET after every drop
               onFilesSelected={(incomingFiles) => {
                  // A. Calculate strictly how many slots are left
                  const currentTotal = currentImages.length + selectedRawFiles.length;
                  const slotsLeft = MAX_IMAGES - currentTotal;
                  
                  if (slotsLeft <= 0) {
                     alert("Maximum image limit reached!");
                     setResetKey(prev => prev + 1); // Reset uploader to clear selection
                     return;
                  }

                  // B. Slice the incoming files if they exceed slots
                  let filesToAdd = incomingFiles;
                  if (incomingFiles.length > slotsLeft) {
                     alert(`Limit reached! Only adding the first ${slotsLeft} images.`);
                     filesToAdd = incomingFiles.slice(0, slotsLeft);
                  }

                  // C. Append to our Master List
                  setSelectedRawFiles(prev => [...prev, ...filesToAdd]);
                  
                  // D. Reset the Uploader Component (so it's ready for next batch)
                  setResetKey(prev => prev + 1);
               }} 
             />
          ) : (
            <div className="p-4 bg-gray-100 rounded-lg text-center text-xs text-gray-500 border border-dashed border-gray-300">
               Maximum of {MAX_IMAGES} images reached. Remove some to add more.
            </div>
          )}
        </div>
      </div>
      {/* 2. MARKETING & PRICING */}
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

      {/* 3. CATEGORIZATION */}
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
                // 👇 PASS THE INITIAL ID HERE
                initialCategoryId={initialData?.categoryId}
                onSelectionChange={(id) => field.onChange(id || "")}
              />
            )}
          />
        </div>
      </div>
      {/* 4. INVENTORY */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-xl font-semibold text-gray-700">Inventory</h2>
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
            <input
              type="checkbox"
              checked={hasVariants}
              onChange={(e) => setHasVariants(e.target.checked)}
              className="w-4 h-4 accent-black cursor-pointer"
            />
            <label className="text-sm font-medium cursor-pointer">
              Has Variations?
            </label>
          </div>
        </div>

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
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <label className="label">Total Stock Quantity</label>
            <input
              type="number"
              className="input-field text-lg font-medium w-full md:w-1/3"
              {...register("stock", {
                required: !hasVariants,
                min: 0,
                valueAsNumber: true,
              })}
            />
          </div>
        )}
      </div>

      {isEditMode && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            Store Visibility
          </h3>
          <p className="text-sm text-gray-500">
            Control if this product is hidden from customers.
          </p>

          <Controller
            name="visible"
            control={control}
            // 👇 CRITICAL: Default to true if undefined
            defaultValue={initialData?.visible ?? true}
            render={({ field }) => (
              <div className="flex items-center gap-4">
                {/* Option 1: Visible */}
                <label
                  className={`flex items-center gap-2 cursor-pointer p-2 rounded border transition ${field.value === true ? "bg-green-50 border-green-200 ring-1 ring-green-500" : "bg-white border-gray-200"}`}
                >
                  <input
                    type="radio"
                    // 👇 We manually handle the change to ensure BOOLEAN
                    onChange={() => field.onChange(true)}
                    checked={field.value === true}
                    className="w-4 h-4 accent-green-600"
                  />
                  <span className="flex items-center gap-1 text-green-700 font-medium">
                    <Eye size={16} /> Visible
                  </span>
                </label>

                {/* Option 2: Hidden */}
                <label
                  className={`flex items-center gap-2 cursor-pointer p-2 rounded border transition ${field.value === false ? "bg-gray-100 border-gray-300 ring-1 ring-gray-400" : "bg-white border-gray-200"}`}
                >
                  <input
                    type="radio"
                    // 👇 We manually handle the change to ensure BOOLEAN
                    onChange={() => field.onChange(false)}
                    checked={field.value === false}
                    className="w-4 h-4 accent-gray-500"
                  />
                  <span className="flex items-center gap-1 text-gray-600 font-medium">
                    <EyeOff size={16} /> Hidden (Draft)
                  </span>
                </label>
              </div>
            )}
          />
        </div>
      )}

      {/* SUBMIT */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading || isUploading}
          className="w-full bg-black text-white py-4 rounded-lg text-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {(isUploading || isLoading) && <Loader2 className="animate-spin" />}
          {isUploading
            ? "Uploading Images..."
            : isLoading
              ? "Saving..."
              : isEditMode
                ? "Update Product"
                : "Publish Product"}
        </button>
      </div>
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
          box-shadow: 0 0 0 2px #bfdbfe;
        }
      `}</style>
    </form>
  );
}
