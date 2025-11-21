import { useState, useEffect } from 'react';
import { authService, User, AuthState } from './authService';

/**
 * React hook for authentication
 * Provides reactive auth state and methods
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: authService.getCurrentUser(),
    isAuthenticated: authService.isAuthenticated(),
    isLoading: true,
  });

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.subscribe((state) => {
      setAuthState({ ...state, isLoading: false });
    });

    // Mark as loaded after initial check
    setAuthState(prev => ({ ...prev, isLoading: false }));

    return unsubscribe;
  }, []);

  const login = async (email: string, name?: string): Promise<User> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const user = await authService.loginMock(email, name);
      return user;
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const loginWithProvider = async (provider: 'google' | 'github'): Promise<User> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const user = await authService.loginWithProvider(provider);
      return user;
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const logout = async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      await authService.logout();
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    login,
    loginWithProvider,
    logout,
  };
}
