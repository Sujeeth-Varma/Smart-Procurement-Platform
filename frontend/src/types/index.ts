export type UserRole = 'USER' | 'ADMIN' | 'SUPPLIER';

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface Department {
  departmentId: number;
  departmentName: string;
  manager?: string;
}

export interface Category {
  categoryId: number;
  categoryName: string;
}

export interface UserProfile {
  userId: number;
  name: string;
  email: string;
  phoneNumber?: string;
  designation?: string;
  role: UserRole;
  status: UserStatus;
  department?: Department;
}

export interface AuthResponse {
  message: string;
  token: string;
  role: UserRole;
  user?: UserProfile;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  designation: string;
  departmentId: number;
}

export interface Product {
  productId: number;
  name: string;
  pricePerProduct?: number;
  price?: number;
  numberOfQuantities?: number;
  description?: string;
  status?: string;
  category?: Category;
}

export interface ProcurementRequest {
  requestId: number;
  productId?: number;
  productName?: string;
  requestedQuantity?: number;
  quantity?: number;
  pricePerUnit?: number;
  totalPrice?: number;
  description?: string;
  status: 'PENDING_FOR_APPROVAL' | 'ACTIVE' | 'CLOSED';
  createdDate?: string;
  updatedDate?: string;
  userEmail?: string;
  departmentName?: string;
}

export interface Supplier {
  supplierId: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  gstNumber?: string;
  status?: string;
  rating?: number;
}
