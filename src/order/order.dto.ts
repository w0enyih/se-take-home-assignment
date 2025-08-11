export const OrderStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const OrderType = {
  NORMAL: 'NORMAL',
  VIP: 'VIP',
} as const;
export type OrderType = (typeof OrderType)[keyof typeof OrderType];

export interface Order {
  id: number;
  type: OrderType;
  createdAt: Date;
  processStartAt: Date | null;
  processEndAt: Date | null;
  status: OrderStatus;
}
