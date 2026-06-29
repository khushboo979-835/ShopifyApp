export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  isActive: boolean;
  shopifyStore?: string;
  shopifyAccessToken?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
}

export interface AdminUpdateUserData extends UpdateUserData {
  role?: 'user' | 'admin';
  isActive?: boolean;
}