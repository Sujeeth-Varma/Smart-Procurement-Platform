import { apiClient, downloadFile } from './client';
import type {
  Category,
  Department,
  PaymentRecord,
  ProcurementRequest,
  Product,
  ProductRatingSummary,
  ProductReviewRequest,
  ProductReviewResponse,
  RequestTrackingRecord,
} from '@/types';

export interface RaiseRequestPayload {
  productId: number;
  numberOfQuantities: number;
  description?: string;
}

export const procurementApi = {
  getProducts: async (): Promise<Product[]> => {
    return apiClient<Product[]>('/api/products');
  },

  getCategories: async (): Promise<Category[]> => {
    return apiClient<Category[]>('/api/categories');
  },

  getDepartments: async (): Promise<Department[]> => {
    return apiClient<Department[]>('/api/departments');
  },

  raiseRequest: async (payload: RaiseRequestPayload): Promise<ProcurementRequest> => {
    return apiClient<ProcurementRequest>('/api/raise-req', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getPendingRequests: async (): Promise<ProcurementRequest[]> => {
    return apiClient<ProcurementRequest[]>('/api/request/pending');
  },

  getRequestStatus: async (requestId: number): Promise<ProcurementRequest> => {
    return apiClient<ProcurementRequest>(`/api/request/status?requestId=${requestId}`);
  },

  getRequestTracking: async (requestId: number): Promise<RequestTrackingRecord[]> => {
    return apiClient<RequestTrackingRecord[]>(`/api/request/${requestId}/tracking`);
  },

  getUserPayments: async (exportCsv: boolean = false): Promise<PaymentRecord[]> => {
    return apiClient<PaymentRecord[]>(`/api/payment/user${exportCsv ? '?exportCsv=true' : ''}`);
  },

  downloadUserPaymentsCsv: async (): Promise<void> => {
    return downloadFile('/api/payment/user?exportCsv=true', 'user_payment_history.csv');
  },

  // Reviews & Ratings
  submitReview: async (payload: ProductReviewRequest): Promise<ProductReviewResponse> => {
    return apiClient<ProductReviewResponse>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getReviewByRequestId: async (requestId: number): Promise<ProductReviewResponse> => {
    return apiClient<ProductReviewResponse>(`/api/reviews/request/${requestId}`);
  },

  getReviewsByProductId: async (productId: number): Promise<ProductReviewResponse[]> => {
    return apiClient<ProductReviewResponse[]>(`/api/reviews/product/${productId}`);
  },

  getProductRatingSummary: async (productId: number): Promise<ProductRatingSummary> => {
    return apiClient<ProductRatingSummary>(`/api/reviews/product/${productId}/summary`);
  },
};
