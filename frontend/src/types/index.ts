export type UserRole = 'USER' | 'ADMIN' | 'SUPPLIER';

export interface Department {
  departmentId: number;
  departmentName: string;
  managerOfDepartment?: string;
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
  status: string;
  department?: Department;
  createdDate?: string;
}

export interface AuthState {
  token: string | null;
  role: UserRole | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
}

export interface LoginResponse {
  token: string;
  type?: string;
  role: UserRole;
  user?: UserProfile;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  designation: string;
  departmentId: number;
}

export type AuthResponse = LoginResponse;
export type RegisterRequest = SignupRequest;

export interface Product {
  productId: number;
  name: string;
  pricePerProduct?: number;
  price?: number;
  description?: string;
  status?: string;
  category?: Category;
  averageRating?: number;
  totalReviews?: number;
}

export interface ProcurementRequest {
  requestId: number;
  productId?: number;
  productName?: string;
  userName?: string;
  userEmail?: string;
  departmentName?: string;
  requestedQuantity?: number;
  quantity?: number;
  pricePerUnit?: number;
  totalPrice?: number;
  categoryName?: string;
  description?: string;
  status: string;
  createdDate?: string;
  updatedDate?: string;
  message?: string;
}

export interface RequestTrackingRecord {
  trackingId: number;
  productId?: number;
  productName?: string;
  status: string;
  remarks: string;
  actionTimestamp: string;
  actionBy?: {
    userId?: number;
    name?: string;
    email?: string;
    role?: string;
    designation?: string;
  };
  actionByName?: string;
}

export interface Supplier {
  supplierId: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  accountNumber?: string;
  bankName?: string;
  gstNumber?: string;
  status?: string;
  rating?: number;
  feedback?: string;
  products?: Product[];
}

export interface PaymentRecord {
  paymentId: number;
  requestId: number;
  productName?: string;
  adminUserId?: number;
  adminEmail?: string;
  adminName?: string;
  requestUserId?: number;
  requestUserEmail?: string;
  requestUserName?: string;
  supplierId?: number;
  supplierName?: string;
  supplierAccountNumber?: string;
  amount: number;
  cardNumber?: string;
  cardHolderName?: string;
  paymentStatus?: string;
  status?: string;
  transactionDate?: string;
  paymentDate?: string;
  remarks?: string;
  message?: string;
}

export interface ProductReviewRequest {
  requestId: number;
  rating: number;
  comment?: string;
}

export interface ProductReviewResponse {
  reviewId: number;
  requestId: number;
  productId: number;
  productName: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  createdDate: string;
}

export interface ProductRatingSummary {
  productId: number;
  productName: string;
  averageRating: number;
  totalReviews: number;
}
