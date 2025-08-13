import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { OrderStatus } from './order.dto';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';

jest.useFakeTimers();

describe('OrderService', () => {
    let service: OrderService;
    let eventEmitter: EventEmitter2;

    const waitForEvent = <T extends any[] = any[]>(
        eventEmitter: {
            once: (event: string, listener: (...args: any[]) => void) => void;
        },
        eventName: string,
    ): Promise<T> =>
        new Promise<T>((resolve) =>
            eventEmitter.once(eventName, (...args) => resolve(args as T)),
        );

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [EventEmitterModule.forRoot()],
            providers: [OrderService],
        }).compile();

        await module.init();

        service = module.get<OrderService>(OrderService);
        eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    });

    it('should add normal orders to normalQueue', () => {
        const emitSpy = jest.spyOn(eventEmitter, 'emit');

        service.addNormalOrder();
        service.addNormalOrder();

        expect(emitSpy).toHaveBeenCalledTimes(2);
        emitSpy.mock.calls.forEach(([eventName]) => {
            expect(eventName).toBe('order.created');
        });

        expect(service.getNormalQueue().length).toBe(2);
    });

    it('should add VIP orders to vipQueue', () => {
        const emitSpy = jest.spyOn(eventEmitter, 'emit');

        service.addVIPOrder();
        service.addVIPOrder();

        emitSpy.mock.calls.forEach(([eventName]) => {
            expect(eventName).toBe('order.created');
        });

        expect(service.getVIPQueue().length).toBe(2);
    });

    it('should return the next order from vipQueue first if available', () => {
        const emitSpy = jest.spyOn(eventEmitter, 'emit');

        service.addNormalOrder();
        service.addNormalOrder();
        const vipOrder = service.addVIPOrder();
        expect(emitSpy).toHaveBeenCalledTimes(3);

        emitSpy.mock.calls.forEach(([eventName]) => {
            expect(eventName).toBe('order.created');
        });

        expect(service.getNextOrder()).toEqual(vipOrder);
        expect(service.getVIPQueue().length).toBe(0);
        expect(service.getNormalQueue().length).toBe(2);
    });

    it('should return the next order from normalQueue if vipQueue is empty', () => {
        const normalOrder = service.addNormalOrder();
        service.addNormalOrder();
        service.addVIPOrder();
        service.getNextOrder();
        expect(service.getNextOrder()).toEqual(normalOrder);
        expect(service.getNormalQueue().length).toBe(1);
        expect(service.getVIPQueue().length).toBe(0);
    });

    it('should return undefined if both queues are empty', () => {
        expect(service.getNextOrder()).toBeUndefined();
    });

    it('should complete an order and move it to completedOrders', () => {
        service.addNormalOrder();
        const order = service.getNextOrder();
        if (order) {
            const emitSpy = jest.spyOn(eventEmitter, 'emit');
            service.completeOrder(order);
            expect(emitSpy).toHaveBeenCalledWith('order.completed');
        }

        const completedOrders = service.getCompletedOrders();

        expect(completedOrders.length).toBe(1);
        expect(completedOrders[0]).toEqual(order);
        expect(completedOrders[0]?.status).toBe(OrderStatus.COMPLETED);
        expect(completedOrders[0]?.processEndAt).toBeDefined();
    });

    it('should requeue an order to the top', () => {
        service.addNormalOrder();
        const order = service.getNextOrder();

        if (order) {
            const emitSpy = jest.spyOn(eventEmitter, 'emit');
            service.requeueOrder(order);
            expect(emitSpy).toHaveBeenCalledWith('order.requeued');
        }

        const normalQueue = service.getNormalQueue();
        expect(normalQueue.length).toBe(1);
        expect(normalQueue[0]).toEqual(order);
        expect(normalQueue[0]?.status).toBe(OrderStatus.PENDING);
        expect(normalQueue[0]?.processEndAt).toBeUndefined();
    });

    it('should mark the order as completed, set end time, store it, and emit event', async () => {
        const order = service.addNormalOrder();
        order.botId = 1;
        order.processStartAt = new Date();

        const completedPromise = waitForEvent<[typeof order]>(
            eventEmitter,
            'order.completed',
        );

        const emitSpy = jest.spyOn(eventEmitter, 'emit');
        eventEmitter.emit('order.complete', order);

        // wait until event order.completed is emitted
        await completedPromise;
        const completedOrders = service.getCompletedOrders();

        expect(completedOrders.length).toBe(1);
        expect(completedOrders[0]).toEqual(order);
        expect(completedOrders[0]?.status).toBe(OrderStatus.COMPLETED);
        expect(completedOrders[0]?.processEndAt).toBeDefined();
        expect(emitSpy).toHaveBeenCalledWith('order.completed');
    });

    it('should handle order.requeue and emit order.requeued', async () => {
        const order = service.addNormalOrder();
        order.status = OrderStatus.PROCESSING;
        order.botId = 1;
        order.processStartAt = new Date();

        const spyHandler = jest.spyOn(service, 'handleOrderRequeueEvent');
        const spyEnqueue = jest.spyOn(service['normalQueue'], 'enqueueTop');
        const emitSpy = jest.spyOn(eventEmitter, 'emit');
        const requeuedPromise = waitForEvent<[typeof order]>(
            eventEmitter,
            'order.requeued',
        );

        eventEmitter.emit('order.requeue', order);

        expect(spyHandler).toHaveBeenCalledWith(order);

        // Wait for order.requeued
        await requeuedPromise;

        // Order fields should be reset
        expect(order.status).toBe(OrderStatus.PENDING);
        expect(order.botId).toBeUndefined();
        expect(order.processStartAt).toBeUndefined();
        expect(order.processEndAt).toBeUndefined();

        // Should have been enqueued into the correct queue
        expect(spyEnqueue).toHaveBeenCalledWith(order);
        expect(emitSpy).toHaveBeenCalledWith('order.requeued');
    });
});
