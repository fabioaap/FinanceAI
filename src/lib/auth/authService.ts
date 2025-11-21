/**
 * Authentication Module for FinanceAI
 * 
 * Provides authentication functionality with support for:
 * - Mock/Local authentication (development)
 * - OAuth providers (future: Google, GitHub, etc.)
 * - Session management
 * 
 * Environment variables required:
 * - VITE_AUTH_PROVIDER: 'mock' | 'supabase' | 'firebase' (default: 'mock')
 * - VITE_SUPABASE_URL: Supabase project URL (if using Supabase)
 * - VITE_SUPABASE_ANON_KEY: Supabase anonymous key (if using Supabase)
 */

import { settingsRepository } from '../db';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  provider: 'mock' | 'google' | 'github' | 'supabase';
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

class AuthService {
  private currentUser: User | null = null;
  private listeners: Set<(state: AuthState) => void> = new Set();

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    // Load user from settings (localStorage via Dexie)
    try {
      const savedUser = await settingsRepository.get<User>('auth:user');
      if (savedUser) {
        this.currentUser = savedUser;
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to load saved user:', error);
    }
  }

  /**
   * Subscribe to authentication state changes
   */
  subscribe(listener: (state: AuthState) => void) {
    this.listeners.add(listener);
    // Immediately call with current state
    listener(this.getState());
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const state = this.getState();
    this.listeners.forEach(listener => listener(state));
  }

  private getState(): AuthState {
    return {
      user: this.currentUser,
      isAuthenticated: this.currentUser !== null,
      isLoading: false,
    };
  }

  /**
   * Mock login - for development/testing
   * In production, replace with real OAuth flow
   */
  async loginMock(email: string, name?: string): Promise<User> {
    const user: User = {
      id: `mock_${Date.now()}`,
      email,
      name: name || email.split('@')[0],
      provider: 'mock',
      createdAt: new Date().toISOString(),
    };

    this.currentUser = user;
    await settingsRepository.set('auth:user', user);
    this.notifyListeners();

    return user;
  }

  /**
   * OAuth login - Placeholder for future implementation
   * TODO: Implement with Supabase Auth or Firebase Auth
   */
  async loginWithProvider(provider: 'google' | 'github'): Promise<User> {
    // This is a placeholder - implement with real OAuth
    console.warn(`OAuth login with ${provider} not yet implemented. Using mock.`);
    return this.loginMock(`user@${provider}.com`, `${provider} User`);
  }

  /**
   * Logout user and clear session
   */
  async logout(): Promise<void> {
    this.currentUser = null;
    await settingsRepository.delete('auth:user');
    this.notifyListeners();
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Get user ID for sync operations
   */
  getUserId(): string | null {
    return this.currentUser?.id || null;
  }
}

// Singleton instance
export const authService = new AuthService();

/**
 * Example .env.example configuration:
 * 
 * # Authentication Configuration
 * VITE_AUTH_PROVIDER=mock
 * 
 * # Supabase Configuration (if using Supabase)
 * # VITE_SUPABASE_URL=https://your-project.supabase.co
 * # VITE_SUPABASE_ANON_KEY=your-anon-key
 * 
 * # Firebase Configuration (if using Firebase)
 * # VITE_FIREBASE_API_KEY=your-api-key
 * # VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
 * # VITE_FIREBASE_PROJECT_ID=your-project-id
 */
