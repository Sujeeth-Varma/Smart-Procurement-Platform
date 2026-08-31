import { apiClient, downloadFile } from './client';
import type { PaymentRecord, ProcurementRequest, Supplier, UserProfile } from '@/types';

export interface ProcessPaymentPayload {
  requestId: number;
  supplierId: number;
  cardNumber: string;
  cardHolderName: string;
  expiryDate: string;
  cvv: string;
  remarks?: string;
}

export const adminApi = {
  getPendingRequests: async (): Promise<ProcurementRequest[]> => {
    return apiClient<ProcurementRequest[]>('/api/request/pending');
  },

  getApprovedRequests: async (): Promise<ProcurementRequest[]> => {
    return apiClient<ProcurementRequest[]>('/api/request/approved');
  },

  getAllRequests: async (): Promise<ProcurementRequest[]> => {
    return apiClient<ProcurementRequest[]>('/api/request/all');
  },

  updateRequestStatus: async (requestId: number, action: 'APPROVE' | 'REJECT'): Promise<ProcurementRequest> => {
    return apiClient<ProcurementRequest>('/api/request/status', {
      method: 'POST',
      body: JSON.stringify({ requestId, status: action }),
    });
  },

  deleteRequest: async (requestId: number): Promise<{ message: string; success: boolean }> => {
    return apiClient(`/api/request/${requestId}`, {
      method: 'DELETE',
    });
  },

  getUsers: async (): Promise<UserProfile[]> => {
    return apiClient<UserProfile[]>('/api/users');
  },

  getUserById: async (id: number): Promise<UserProfile> => {
    return apiClient<UserProfile>(`/api/users/${id}`);
  },

  getSuppliers: async (): Promise<Supplier[]> => {
    return apiClient<Supplier[]>('/api/suppliers');
  },

  getSuppliersByProduct: async (productId: number): Promise<Supplier[]> => {
    return apiClient<Supplier[]>(`/api/suppliers/product/${productId}`);
  },

  processPayment: async (payload: ProcessPaymentPayload): Promise<PaymentRecord> => {
    return apiClient<PaymentRecord>('/api/payment/process', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getPaymentHistory: async (exportCsv: boolean = false): Promise<PaymentRecord[]> => {
    return apiClient<PaymentRecord[]>(`/api/payment/history${exportCsv ? '?exportCsv=true' : ''}`);
  },

  downloadPaymentHistoryCsv: async (): Promise<void> => {
    return downloadFile('/api/payment/history?exportCsv=true', 'payment_history.csv');
  },

  getPaymentByRequestId: async (requestId: number): Promise<PaymentRecord> => {
    return apiClient<PaymentRecord>(`/api/payment/request/${requestId}`);
  },
};
