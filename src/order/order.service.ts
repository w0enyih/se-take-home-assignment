import { Injectable } from '@nestjs/common';
import { Queue } from '../common/queue';
import * as OrderDto from './order.dto';
import { Order, OrderStatus, OrderType } from './order.dto';
import { FileLogger } from 'src/common/fileLogger';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class OrderService {
    private readonly logger = new FileLogger(`Order`);

    // create a queue to hold orders for normal pending, VIP pending, and completed orders
    private normalQueue: Queue<Order> = new Queue<Order>();
    private vipQueue: Queue<Order> = new Queue<Order>();
    private completedOrders: Order[] = [];

    // counter to generate unique order IDs
    // this is a simple implementation, in a real-world application, might want to use a more robust ID generation strategy
    private orderIdCounter: number = 101;

    constructor(private readonly eventEmitter: EventEmitter2) {}

    addNormalOrder(): Order {
        return this.addOrder(OrderType.NORMAL);
    }

    addVIPOrder(): Order {
        return this.addOrder(OrderType.VIP);
    }

    private addOrder(type: OrderType): Order {
        const order: Order = {
            id: this.orderIdCounter++,
            type: type,
            createdAt: new Date(),
            status: OrderStatus.PENDING,
        };

        if (type === OrderType.VIP) {
            this.vipQueue.enqueue(order);
        } else {
            this.normalQueue.enqueue(order);
        }

        this.logger.log(`New ${type} order. #${order.id}`);
        this.eventEmitter.emit('order.created');
        return order;
    }

    hasPendingOrder(): boolean {
        return !this.normalQueue.isEmpty() || !this.vipQueue.isEmpty();
    }

    getNextOrder(): Order | undefined {
        if (!this.vipQueue.isEmpty()) {
            return this.vipQueue.dequeue();
        } else if (!this.normalQueue.isEmpty()) {
            return this.normalQueue.dequeue();
        }

        return undefined;
    }

    @OnEvent('order.complete')
    handleOrderCompleteEvent(order: OrderDto.Order): void {
        this.completeOrder(order);
    }

    completeOrder(order: Order): void {
        order.status = OrderStatus.COMPLETED;
        order.processEndAt = new Date();
        this.completedOrders.push(order);
        this.logger.log(`Order #${order.id} completed by bot ${order?.botId}.`);
        this.eventEmitter.emit('order.completed');
    }

    @OnEvent('order.requeue')
    handleOrderRequeueEvent(order: OrderDto.Order): void {
        this.requeueOrder(order);
    }

    requeueOrder(order: OrderDto.Order): void {
        order.status = OrderStatus.PENDING;
        order.botId = undefined;
        order.processStartAt = undefined;
        order.processEndAt = undefined;

        if (order.type === OrderType.VIP) {
            this.vipQueue.enqueueTop(order);
        } else {
            this.normalQueue.enqueueTop(order);
        }

        this.logger.log(`Order #${order.id} requeued.`);
        this.eventEmitter.emit('order.requeued');
    }

    getNormalQueue(): Order[] {
        return this.normalQueue.getAll();
    }

    getVIPQueue(): Order[] {
        return this.vipQueue.getAll();
    }

    getPendingOrders(): Order[] {
        return [...this.getVIPQueue(), ...this.getNormalQueue()];
    }

    getCompletedOrders(): Order[] {
        return this.completedOrders;
    }
}
