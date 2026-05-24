export interface DashboardStats {
  totalProducts: number;
  totalCustomers: number;
  totalOrders: number;
  todaysSales: number;
  pendingOrders: number;
  lowStockProducts: number;
}

export interface DashboardRecentOrder {
  id: number;
  customerName: string;
  status: string;
  totalAmount: number;
  orderDate: string;
}

export interface DashboardLowStockProduct {
  name: string;
  stock: number;
  isAvailable: boolean;
}

export interface DashboardData {
  stats: DashboardStats;
  recentOrders: DashboardRecentOrder[];
  lowStockProducts: DashboardLowStockProduct[];
}
