'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/app/utils/axiosInstance';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const LogoutPage = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    useEffect(() => {
        const performLogout = async () => {
            try {
                // Call your backend route
                await axiosInstance.get('/api/auth/logout-user');
                
                // Clear the React Query cache (removes user data from memory)
                queryClient.clear();
                
                toast.success("Logged out successfully");
                
                // Redirect to login
                router.push('/login');
            } catch (error) {
                toast.error("Logout failed. Please try again.");
                router.push('/profile');
            }
        };

        performLogout();
    }, [router, queryClient]);

    return (
        <div className="w-full min-h-screen bg-white flex items-center justify-center">
            <p className="text-[10px] tracking-[0.3em] uppercase text-gray-400 animate-pulse">
                Logging you out...
            </p>
        </div>
    );
};

export default LogoutPage;