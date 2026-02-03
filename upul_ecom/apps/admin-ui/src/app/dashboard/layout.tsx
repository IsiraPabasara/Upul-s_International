"use client";
import { useEffect } from "react";
import useAdmin from "@/app/hooks/useAdmin";
import axiosInstance from "@/app/utils/axiosInstance";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isError } = useAdmin();
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    if (isError) {
      const logout = async () => {
        try {
          await axiosInstance.get('/api/auth/logout-user');
        } catch (error) {
          console.error('Logout error:', error);
        }
        queryClient.clear();
        router.push('/login');
      };
      logout();
    }
  }, [isError, queryClient, router]);

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return null;
  }

  return (
    <section className="">
      {/* <AdminSidebar /> */}
      <div className="">
        {children}
      </div>
    </section>
  );
}