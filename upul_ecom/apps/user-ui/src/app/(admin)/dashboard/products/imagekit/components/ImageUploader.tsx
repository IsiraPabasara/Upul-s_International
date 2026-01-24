'use client';

import { IKContext, IKUpload } from 'imagekitio-react';
import { useState } from 'react';
import axiosInstance from '@/app/utils/axiosInstance';
import toast from 'react-hot-toast';
import { UploadCloud, X, ImageIcon } from 'lucide-react';

interface UploadedImage {
  fileId: string;
  url: string;
}

interface ImageUploaderProps {
  onUploadSuccess: (images: UploadedImage[]) => void;
  initialImages?: UploadedImage[];
}

export default function ImageUploader({ onUploadSuccess, initialImages = [] }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedImage[]>(initialImages);

  // 1. Authenticator using axiosInstance
  const authenticator = async () => {
    try {
      // isPublic: false because only authorized admins should be able to get upload signatures
      const response = await axiosInstance.get('/api/imagekit/auth');
      return response.data; 
    } catch (error: any) {
      toast.error("Failed to authenticate with Image Server");
      throw new Error(`Authentication failed`);
    }
  };

  const onSuccess = (res: any) => {
    setUploading(false);
    const newImage = {
      fileId: res.fileId,
      url: res.url,
    };

    const updatedList = [...uploadedFiles, newImage];
    setUploadedFiles(updatedList);
    onUploadSuccess(updatedList);
    toast.success("Image uploaded!");
  };

  const onError = (err: any) => {
    setUploading(false);
    console.error('Upload Error:', err);
    toast.error("Upload failed. Please try again.");
  };

  const removeImage = (fileId: string) => {
    const updatedList = uploadedFiles.filter(img => img.fileId !== fileId);
    setUploadedFiles(updatedList);
    onUploadSuccess(updatedList);
    toast.success("Image removed from selection");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-semibold text-gray-700">Product Media</label>
        <span className="text-[10px] text-gray-400 uppercase tracking-widest">
          {uploadedFiles.length} Images Selected
        </span>
      </div>

      <IKContext
        publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || ""}
        urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ""}
        authenticator={authenticator}
      >
        <div className="group relative border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-black hover:bg-gray-50 transition-all cursor-pointer">
          <IKUpload
            fileName="product-image.jpg"
            useUniqueFileName={true}
            validateFile={(file: any) => file.size < 5000000} 
            onSuccess={onSuccess}
            onError={onError}
            onUploadStart={() => setUploading(true)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />

          <div className="flex flex-col items-center justify-center space-y-2">
            {uploading ? (
              <>
                <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
                <p className="text-sm font-medium text-black">Uploading to Cloud...</p>
              </>
            ) : (
              <>
                <div className="p-3 bg-gray-100 rounded-full group-hover:bg-black group-hover:text-white transition-colors">
                  <UploadCloud size={24} />
                </div>
                <div className="text-sm">
                  <span className="text-black font-semibold">Click to upload</span> or drag and drop
                </div>
                <p className="text-xs text-gray-400">PNG, JPG or WEBP (Max 5MB)</p>
              </>
            )}
          </div>
        </div>
      </IKContext>

      {/* --- Image Preview Grid --- */}
      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6 animate-fadeIn">
          {uploadedFiles.map((img) => (
            <div key={img.fileId} className="relative aspect-square group rounded-xl overflow-hidden border border-gray-100 shadow-sm">
              <img 
                src={img.url} 
                alt="Product Preview" 
                className="w-full h-full object-cover transition-transform group-hover:scale-110" 
              />
              
              {/* Overlay for Delete Action */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeImage(img.fileId)}
                  className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors shadow-lg"
                  title="Remove Image"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!uploadedFiles.length && !uploading && (
        <div className="flex items-center justify-center gap-2 py-4 border border-gray-50 rounded-xl bg-gray-50/50">
           <ImageIcon size={16} className="text-gray-300" />
           <p className="text-xs text-gray-400">No images uploaded yet</p>
        </div>
      )}
    </div>
  );
}