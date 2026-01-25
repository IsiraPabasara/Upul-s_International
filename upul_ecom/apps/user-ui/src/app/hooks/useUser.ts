import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


interface UseUserOptions {
    required?: boolean;
}

const useUser = ({ required = true }: UseUserOptions = {}) => {
    const router = useRouter();

    const { data: user, isLoading, isError, refetch } = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get("/api/auth/logged-in-user", {
                    isPublic: !required 
                });
                return response.data.user;
            } catch (error) {
                if (!required) return null;
                throw error;
            }
        },
        staleTime: 1000 * 60 * 5,
        retry: required ? 1 : false, 
    });

    
    useEffect(() => {
        if (required && !isLoading && (isError || !user)) {
            router.push("/login");
        }
    }, [required, isLoading, isError, user, router]);

    return { user, isLoading, isError, refetch };
}

export default useUser;