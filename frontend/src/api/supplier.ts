import { apiClient } from './client';
import type { ProcurementRequest, Product, Supplier } from '@/types';

export const supplierApi = {
  getAllSuppliers: async (): Promise<Supplier[]> => {
    return apiClient<Supplier[]>('/api/suppliers');
  },

  getSuppliersByProduct: async (productId: number): Promise<Supplier[]> => {
    return apiClient<Supplier[]>(`/api/suppliers/product/${productId}`);
  },

  getSupplierOrders: async (): Promise<ProcurementRequest[]> => {
    return apiClient<ProcurementRequest[]>('/api/suppliers/orders');
  },

  restockProduct: async (productId: number, quantityToAdd: number, remarks: string): Promise<Product> => {
    return apiClient<Product>(`/api/suppliers/products/${productId}/restock`, {
      method: 'POST',
      body: JSON.stringify({ quantityToAdd, remarks }),
    });
  },

  updateOrderStatus: async (
    requestId: number,
    status: 'ORDER_RECEIVED' | 'ORDER_PACKED' | 'ORDER_DISPATCHED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED',
    remarks?: string
  ): Promise<ProcurementRequest> => {
    return apiClient<ProcurementRequest>(`/api/suppliers/orders/${requestId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, remarks: remarks || `Order status updated to ${status}` }),
    });
  },
};
