export interface ProductStatistics {
  total: number;
  available: number;
  outOfStock: number;
  lowStock: number;
}

export interface OrderStatistics {
  total: number;
  pending: number;
  completed: number;
  cancelled: number;
  todaySales: number;
}

export interface CustomerStatistics {
  total: number;
}

export interface UserStatistics {
  total: number;
  superAdmins: number;
  regularUsers: number;
}

export interface StatisticsResponse {
  products: ProductStatistics;
  orders: OrderStatistics;
  customers: CustomerStatistics;
  users: UserStatistics;
}
