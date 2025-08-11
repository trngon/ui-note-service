/**
 * Authentication-related TypeScript types
 */

export interface User {
  id: string;
  email: string;
  password: string; // In a real app, this would be hashed
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface SignupRequest extends AuthRequest {
  name: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: Omit<User, 'password'>;
}

export interface LoginSession {
  userId: string;
  email: string;
  name: string;
}
