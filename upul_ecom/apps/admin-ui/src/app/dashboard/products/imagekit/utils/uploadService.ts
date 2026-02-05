import axios from 'axios';
import axiosInstance from '@/app/utils/axiosInstance';

export const uploadImageToKit = async (file: File) => {
  try {
    // 1. Get Permission Slip (Signature) from your Backend
    const { data: auth } = await axiosInstance.get('/api/imagekit/auth');

    // 2. Build the payload for ImageKit
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('publicKey', process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '');
    formData.append('signature', auth.signature);
    formData.append('expire', auth.expire);
    formData.append('token', auth.token);
    formData.append('useUniqueFileName', 'true');
    formData.append('folder', '/products'); // Optional: Keep things organized

    // 3. Send directly to ImageKit Cloud
    const response = await axios.post('https://upload.imagekit.io/api/v1/files/upload', formData);

    return {
      fileId: response.data.fileId,
      url: response.data.url
    };
  } catch (error) {
    console.error("Upload failed for file:", file.name, error);
    throw error;
  }
};