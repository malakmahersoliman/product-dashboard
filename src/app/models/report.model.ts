export interface SalesReport {
  from: string;
  to: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  orders: SalesReportItem[];
}

export interface SalesReportItem {
  orderId: number;
  orderDate: string;
  customerName: string;
  totalAmount: number;
}
