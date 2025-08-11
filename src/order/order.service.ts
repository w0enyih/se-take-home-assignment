import { Injectable } from '@nestjs/common';
import { Queue } from '../common/queue';
import { Order, OrderStatus, OrderType } from './order.dto';

@Injectable()
export class OrderService {
  // create a queue to hold orders for normal pending, VIP pending, and completed orders
  private normalQueue: Queue<Order> = new Queue<Order>();
  private vipQueue: Queue<Order> = new Queue<Order>();
  private completedOrders: Order[] = [];

  // counter to generate unique order IDs
  // this is a simple implementation, in a real-world application, might want to use a more robust ID generation strategy
  private orderIdCounter = 100;

  addNormalOrder(): Order {
    return this.addOrder(OrderType.NORMAL);
  }

  addVIPOrder(): Order {
    return this.addOrder(OrderType.VIP);
  }

  private addOrder(type: OrderType): Order {
    const order: Order = {
      id: this.orderIdCounter++,
      type,
      createdAt: new Date(),
      processStartAt: null,
      processEndAt: null,
      status: OrderStatus.PENDING,
    };

    if (type === OrderType.VIP) {
      this.vipQueue.enqueue(order);
    } else {
      this.normalQueue.enqueue(order);
    }

    return order;
  }

  getNextOrder(): Order | undefined {
    if (!this.vipQueue.isEmpty()) {
      return this.vipQueue.dequeue();
    } else if (!this.normalQueue.isEmpty()) {
      return this.normalQueue.dequeue();
    }

    return undefined;
  }

  completeOrder(order: Order): void {
    order.status = OrderStatus.COMPLETED;
    order.processEndAt = new Date();
    this.completedOrders.push(order);
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
