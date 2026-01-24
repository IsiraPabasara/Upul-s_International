'use client';

import { IKContext, IKUpload } from 'imagekitio-react';
import { useState } from 'react';

interface UploadedImage {
  fileId: string;
  url: string;
}

interface ImageUploaderProps {
  onUploadSuccess: (images: UploadedImage[]) => void;
}

export default function ImageUploader({ onUploadSuccess }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedImage[]>([]);

  const authenticator = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/imagekit/auth');
      
      if (!response.ok) throw new Error('Auth failed');
      
      const data = await response.json();
      return data; 
    } catch (error) {
      throw new Error(`Authentication request failed`);
    }
  };

  const onSuccess = (res: any) => {
    setUploading(false);
    
    const newImage = {
      fileId: res.fileId,
      url: res.url,
    };

    console.log("🔥 ImageKit Response:", newImage);

    const updatedList = [...uploadedFiles, newImage];
    setUploadedFiles(updatedList);
    
    onUploadSuccess(updatedList);
  };

  const onError = (err: any) => {
    setUploading(false);
    console.error('Upload Error:', err);
    alert('Upload failed. Check console.');
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">Product Images</label>

      <IKContext
        publicKey="public_IeRRcxkTOy5kNKEIAJaj4/XW4Qg="
        urlEndpoint="https://ik.imagekit.io/uopcxkuda"
        authenticator={authenticator}
      >
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition cursor-pointer relative">
          
          <IKUpload
            fileName="product-image.jpg"
            useUniqueFileName={true}
            validateFile={(file:any) => file.size < 5000000} 
            onSuccess={onSuccess}
            onError={onError}
            onUploadStart={() => setUploading(true)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          {uploading ? (
            <div className="text-blue-600 font-semibold animate-pulse">
              Uploading... Please wait...
            </div>
          ) : (
            <div className="text-gray-500">
              <span className="text-blue-600 font-semibold">Click to upload</span> or drag and drop
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
            </div>
          )}
        </div>
      </IKContext>

      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-4 gap-4 mt-4">
          {uploadedFiles.map((img) => (
            <div key={img.fileId} className="relative group border rounded-lg overflow-hidden">
              <img src={img.url} alt="Uploaded" className="w-full h-24 object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}