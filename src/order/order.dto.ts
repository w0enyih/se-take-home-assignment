export const OrderStatus = {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    COMPLETED: 'COMPLETED',
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
    botId?: number;
    processingTimeInMS?: number; // Optional, can be used to specify custom processing time
    processStartAt?: Date;
    processEndAt?: Date;
    status: OrderStatus;
}
