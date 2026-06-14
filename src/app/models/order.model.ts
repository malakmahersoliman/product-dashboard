export const ORDER_STATUS = {
  pending: 'Pending',
  completed: 'Completed',
  cancelled: 'Cancelled',
} as const;

export const PAYMENT_STATUS = {
  unpaid: 'Unpaid',
  paid: 'Paid',
  paymentFailed: 'PaymentFailed',
  refunded: 'Refunded',
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];
export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

export interface Order {
  id: number;
  orderDate: string;
  status: OrderStatus | string;
  paymentStatus: PaymentStatus | string;
  totalAmount: number;
  customerId: number;
  customerName: string;
  items: OrderItemResponse[];
}
export interface OrderResponse {
  id: number;
  orderDate: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  customerId: number;
  customerName: string;
  items: OrderItemResponse[];
}

export interface OrderSummary {
  id: number;
  orderDate: string;
  status: OrderStatus | string;
  paymentStatus: PaymentStatus | string;
  totalAmount: number;
  customerId: number;
  customerName: string;
  itemCount: number;
}

export interface OrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CreateOrderRequest {
  customerId: number;
  paymentMethod: string;
  paymentShouldSucceed: boolean;
  paymentFailureReason?: string | null;
  items: CreateOrderItemRequest[];
}

export interface CreateOrderItemRequest {
  productId: number;
  quantity: number;
}