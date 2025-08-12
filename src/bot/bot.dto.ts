import { Order } from '../order/order.dto';

export const BotStatus = {
    IDLE: 'IDLE',
    BUSY: 'BUSY',
} as const;
export type BotStatus = (typeof BotStatus)[keyof typeof BotStatus];

export interface Bot {
    id: number;
    status: BotStatus;
    currentOrder?: Order;
    timeout?: NodeJS.Timeout;
}
