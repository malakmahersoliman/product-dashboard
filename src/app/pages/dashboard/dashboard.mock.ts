import { DashboardData } from '../../models/dashboard.model';

export const MOCK_DASHBOARD_DATA: DashboardData = {
  stats: {
    totalProducts: 48,
    totalCustomers: 126,
    totalOrders: 342,
    todaysSales: 4280.5,
    pendingOrders: 7,
    lowStockProducts: 4,
  },
  recentOrders: [
    {
      id: 1042,
      customerName: 'Sarah Johnson',
      status: 'Pending',
      totalAmount: 189.99,
      orderDate: '2026-05-24T09:12:00',
    },
    {
      id: 1041,
      customerName: 'Michael Chen',
      status: 'Completed',
      totalAmount: 542.0,
      orderDate: '2026-05-24T08:45:00',
    },
    {
      id: 1040,
      customerName: 'Emily Davis',
      status: 'Completed',
      totalAmount: 76.5,
      orderDate: '2026-05-23T17:30:00',
    },
    {
      id: 1039,
      customerName: 'James Wilson',
      status: 'Cancelled',
      totalAmount: 210.0,
      orderDate: '2026-05-23T14:20:00',
    },
    {
      id: 1038,
      customerName: 'Lisa Anderson',
      status: 'Pending',
      totalAmount: 315.75,
      orderDate: '2026-05-23T11:05:00',
    },
  ],
  lowStockProducts: [
    { name: 'Wireless Mouse', stock: 3, isAvailable: true },
    { name: 'USB-C Cable 2m', stock: 5, isAvailable: true },
    { name: 'Notebook A5', stock: 2, isAvailable: true },
    { name: 'Desk Lamp LED', stock: 0, isAvailable: false },
  ],
};
