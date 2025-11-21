
export interface SupplyItem {
    id: number;
    name: string;
    type: string;
    model: string;
    quantity: number;
    min_quantity: number;
    unit: string;
    location: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface UsageRecord {
    id: number;
    supply_id: number;
    quantity_used: number;
    used_by: string;
    department: string;
    purpose?: string;
    used_at: string;
    supply_name?: string;
  }
  
  export interface SupplyRequest {
    id: number;
    supply_id: number;
    quantity: number;
    requested_by: string;
    department: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    created_at: string;
    updated_at: string;
    supply_name?: string;
  }
  
  export interface Statistics {
    total_supplies: number;
    total_items: number;
    low_stock_count: number;
    pending_requests: number;
    monthly_usage: Array<{
      month: string;
      amount: number;
    }>;
  }
  
  export interface CreateSupplyData {
    name: string;
    type: string;
    model: string;
    quantity: number;
    min_quantity: number;
    unit: string;
    location: string;
  }
  
  export interface CreateUsageData {
    supply_id: number;
    quantity_used: number;
    used_by: string;
    department: string;
    purpose?: string;
  }
  
  export interface CreateRequestData {
    supply_id: number;
    quantity: number;
    requested_by: string;
    department: string;
  }