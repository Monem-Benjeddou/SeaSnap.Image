import { UserRole } from '../types/user';

export const PERMISSIONS = {
  VIEW_IMAGES: ['Admin', 'editor', 'viewer'],
  UPLOAD_IMAGES: ['Admin', 'editor'],
  DELETE_IMAGES: ['Admin', 'editor'],
  MANAGE_USERS: ['Admin'],
  MANAGE_SETTINGS: ['Admin'],
  EDIT_IMAGES: ['Admin', 'editor'],
} as const;

export const hasPermission = (userRoles: string[] | undefined | null, requiredRoles: string[]): boolean => {
  if (!userRoles || !Array.isArray(userRoles)) {
    return false;
  }
  return userRoles.some(role => requiredRoles.includes(role));
};

export const isAdmin = (userRoles: UserRole[] | undefined | null): boolean => {
  return hasPermission(userRoles, ['admin']);
};

export const isModerator = (userRoles: UserRole[] | undefined | null): boolean => {
  return hasPermission(userRoles, ['moderator']);
};

export const isUser = (userRoles: UserRole[] | undefined | null): boolean => {
  return hasPermission(userRoles, ['user']);
};

export const getRoleColor = (role:string): string => {
  switch (role) {
    case 'Admin':
      return '#ff4d4f';
    case 'editor':
      return '#1890ff';
    case 'viewer':
      return '#52c41a';
    default:
      return '#d9d9d9';
  }
};

export const getRoleLabel = (role:string): string  => {
  switch (role) {
    case 'Admin':
      return 'Administrator';
    case 'editor':
      return 'Editor';
    case 'viewer':
      return 'Viewer';
    default:
      return 'Unknown';
  }
};