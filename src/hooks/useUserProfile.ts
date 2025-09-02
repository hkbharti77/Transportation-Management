import { useAuth } from '@/context/AuthContext';

export const useUserProfile = () => {
  const { user, isLoading, fetchUserProfile } = useAuth();

  return {
    userProfile: user,
    isLoading,
    error: null, // Error handling is now in AuthContext
    fetchUserProfile,
  };
};
