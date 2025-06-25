import api from './api';
import { User, ApiResponse, PaginatedResponse } from '../types';

export const userService = {
  getUsers: async (page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<User>>> => {
    // Mock data for demo
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'admin@demo.com',
        userName: 'Admin User',
        roles: ['admin'],
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        email: 'editor@demo.com',
        userName: 'Editor User',
        roles: ['editor'],
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=editor',
        createdAt: '2024-01-02T00:00:00Z',
      },
      {
        id: '3',
        email: 'viewer@demo.com',
        userName: 'Viewer User',
        roles: ['viewer'],
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=viewer',
        createdAt: '2024-01-03T00:00:00Z',
      },
    ];

    return {
      data: {
        data: mockUsers,
        total: mockUsers.length,
        page,
        limit,
        totalPages: 1,
      },
      success: true,
    };
  },

  createUser: async (userData: Omit<User, 'id' | 'createdAt'>): Promise<ApiResponse<User>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
    };

    return {
      data: newUser,
      success: true,
      message: 'User created successfully',
    };
  },

  updateUser: async (userId: string, updates: Partial<User>): Promise<ApiResponse<User>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedUser: User = {
      id: userId,
      email: 'updated@demo.com',
      userName: 'Updated User',
      roles: ['editor'],
      ...updates,
    };

    return {
      data: updatedUser,
      success: true,
      message: 'User updated successfully',
    };
  },

  deleteUser: async (userId: string): Promise<ApiResponse<null>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      data: null,
      success: true,
      message: 'User deleted successfully',
    };
  },
};