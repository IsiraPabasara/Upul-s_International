'use client';
import { useEffect, useState } from 'react';
import axiosInstance from '@/app/utils/axiosInstance';
import { Product } from '@prisma/client';

export default function ManageProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get('/api/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Failed to fetch products', error);
      }
    };
    fetchProducts();
  }, []);

  const handleVisibilityToggle = async (id: string, visible: boolean) => {
    try {
      await axiosInstance.put(`/api/products/${id}/visibility`, { visible });
      setProducts(products.map(p => p.id === id ? { ...p, visible } : p));
    } catch (error) {
      console.error('Failed to update product visibility', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(product => (
          <div key={product.id} className={`p-4 border rounded ${product.visible ? 'bg-white' : 'bg-gray-200'}`}>
            <h2 className="text-lg font-semibold">{product.name}</h2>
            <p>SKU: {product.sku}</p>
            <p>Price: ${product.price}</p>
            <div className="flex items-center mt-4">
              <label htmlFor={`visible-${product.id}`} className="mr-2">{product.visible ? 'Visible' : 'Hidden'}</label>
              <input
                type="checkbox"
                id={`visible-${product.id}`}
                checked={product.visible}
                onChange={(e) => handleVisibilityToggle(product.id, e.target.checked)}
                className="toggle-checkbox"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
