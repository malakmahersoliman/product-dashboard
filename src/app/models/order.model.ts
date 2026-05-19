export const ORDER_STATUS = {
  pending: 'Pending',
  completed: 'Completed',
  cancelled: 'Cancelled',
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

export interface OrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderResponse {
  id: number;
  orderDate: string;
  status: string;
  totalAmount: number;
  customerId: number;
  customerName: string;
  items: OrderItemResponse[]; //this cuz of the relation between order and orderitems
}

export interface CreateOrderItemRequest {
  productId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  customerId: number;
  items: CreateOrderItemRequest[];
}