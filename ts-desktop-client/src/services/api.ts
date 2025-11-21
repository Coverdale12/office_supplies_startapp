import axios from 'axios';

import { 
  SupplyItem, 
  UsageRecord, 
  SupplyRequest, 
  Statistics, 
  CreateSupplyData, 
  CreateUsageData, 
  CreateRequestData 
} from '../types/types';

const API_BASE_URL = 'http://localhost:5600';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Supplies API
export const suppliesApi = {
  getAll: (): Promise<SupplyItem[]> => 
    api.get('/supplies').then(response => response.data),

  getById: (id: number): Promise<SupplyItem> => 
    api.get(`/supplies/${id}`).then(response => response.data),

  create: (data: CreateSupplyData): Promise<SupplyItem> => 
    api.post('/supplies', data).then(response => response.data),

  update: (id: number, data: Partial<CreateSupplyData>): Promise<SupplyItem> => 
    api.put(`/supplies/${id}`, data).then(response => response.data),

  delete: (id: number): Promise<void> => 
    api.delete(`/supplies/${id}`),

  getLowStock: (): Promise<SupplyItem[]> => 
    api.get('/supplies/low-stock').then(response => response.data),
};

// Usage API
export const usageApi = {
  recordUsage: (data: CreateUsageData): Promise<UsageRecord> => 
    api.post('/usage', data).then(response => response.data),

  getHistory: (params?: { 
    supply_id?: number; 
    department?: string; 
    start_date?: string; 
    end_date?: string; 
  }): Promise<UsageRecord[]> => 
    api.get('/usage/history', { params }).then(response => response.data),
};

// Requests API
export const requestsApi = {
  getAll: (status?: string): Promise<(SupplyRequest & { supply_name: string })[]> => 
    api.get('/requests', { params: { status } }).then(response => response.data),

  create: (data: CreateRequestData): Promise<SupplyRequest> => 
    api.post('/requests', data).then(response => response.data),

  updateStatus: (id: number, status: string): Promise<void> => 
    api.put(`/requests/${id}/status`, { status }),
};

// Statistics API
export const statisticsApi = {
  get: (): Promise<Statistics> => 
    api.get('/statistics').then(response => response.data),
};

// Health check
export const healthApi = {
  check: (): Promise<{ status: string; database: string }> => 
    api.get('/health').then(response => response.data),
};