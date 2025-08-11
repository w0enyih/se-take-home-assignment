import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { OrderStatus } from './order.dto';

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderService],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should add VIP orders to vipQueue', () => {
    service.addVIPOrder();
    service.addVIPOrder();
    expect(service.getVIPQueue().length).toBe(2);
  });

  it('should add normal orders to normalQueue', () => {
    service.addNormalOrder();
    service.addNormalOrder();
    expect(service.getNormalQueue().length).toBe(2);
  });

  it('should return the next order from vipQueue first if available', () => {
    service.addNormalOrder();
    service.addNormalOrder();
    const vipOrder = service.addVIPOrder();
    service.addVIPOrder()
    expect(service.getNextOrder()).toEqual(vipOrder);
    expect(service.getVIPQueue().length).toBe(1);
    expect(service.getNormalQueue().length).toBe(2);
  });

  it('should return the next order from normalQueue if vipQueue is empty', () => {
    const normalOrder = service.addNormalOrder();
    expect(service.getNextOrder()).toEqual(normalOrder);
    expect(service.getNormalQueue().length).toBe(0);
  });

  it('should return undefined if both queues are empty', () => {
    expect(service.getNextOrder()).toBeUndefined();
  });

  it('should complete an order and move it to completedOrders', () => {
    const order = service.addNormalOrder();
    service.getNextOrder();
    service.completeOrder(order);
    expect(order.status).toBe(OrderStatus.COMPLETED);
    expect(order.processEndAt).toBeDefined();
    expect(service.getCompletedOrders().length).toBe(1);
  });
});
