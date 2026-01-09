import { createContext, useContext, useEffect, useState } from 'react';
import { authAPI, setAuthToken, removeAuthToken, isAuthenticated } from '../lib/api';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      if (isAuthenticated()) {
        try {
          console.log('Initializing auth - token found, fetching user profile...');
          const response = await authAPI.getProfile();
          setUser(response.data.data);
          console.log('Auth initialized successfully:', response.data.data);
        } catch (error) {
          console.error('Failed to fetch user profile during init:', error);
          console.log('Removing invalid token...');
          removeAuthToken();
          setUser(null);
        }
      } else {
        console.log('No authentication token found during init');
      }
      setLoading(false);
      setInitialized(true);
    };

    initAuth();
  }, []);

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeAuthToken();
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await authAPI.updateProfile(profileData);
      const updatedUser = response.data.data;
      
      setUser(updatedUser);
      toast.success('Profile updated successfully!');
      return { success: true, user: updatedUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user is admin
  const isAdmin = () => {
    return hasRole('admin');
  };

  // Refresh user data
  const refreshUser = async () => {
    if (!isAuthenticated()) {
      console.log('RefreshUser: No token found, skipping refresh');
      return;
    }
    
    try {
      console.log('RefreshUser: Fetching user profile...');
      const response = await authAPI.getProfile();
      setUser(response.data.data);
      console.log('RefreshUser: Success -', response.data.data);
    } catch (error) {
      console.error('RefreshUser: Failed to refresh user:', error);
      
      // Only remove token if it's actually invalid (401/403), not on network errors
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.log('RefreshUser: Invalid token, removing...');
        removeAuthToken();
        setUser(null);
      } else {
        console.log('RefreshUser: Network or server error, keeping token');
      }
      
      throw error;
    }
  };

  const value = {
    user,
    setUser, // Expose setUser for sign-in page
    loading,
    initialized,
    logout,
    updateProfile,
    hasRole,
    isAdmin,
    refreshUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
