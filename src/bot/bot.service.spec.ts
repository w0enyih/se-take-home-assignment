import { Test, TestingModule } from '@nestjs/testing';
import { BotService } from './bot.service';
import { OrderService } from '../order/order.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '../../config/configuration';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';

jest.useFakeTimers();

describe('BotService', () => {
    let service: BotService;
    let orderService: OrderService;
    let eventEmitter: EventEmitter2;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                EventEmitterModule.forRoot(),
                ConfigModule.forRoot({
                    load: [configuration],
                    isGlobal: true,
                }),
            ],
            providers: [BotService, OrderService],
        }).compile();

        service = module.get<BotService>(BotService);
        orderService = module.get<OrderService>(OrderService);
        eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    });

    // for debugging purposes
    // afterEach(() => {
    //     console.log(`Bots`, service.getBots());
    //     console.log(`IdleQueue:`, service.getIdleQueue());
    // });

    it('should add a bot', () => {
        const emitSpy = jest.spyOn(eventEmitter, 'emit');
        const bot = service.addBot();
        expect(emitSpy).toHaveBeenCalledWith('bot.added');
        expect(bot).toBeDefined();
        expect(bot.id).toBe(1);
        expect(bot.status).toBe('IDLE');
    });

    it('should remove the newest bot', () => {
        const firstBot = service.addBot();
        const secondBot = service.addBot();
        expect(service.getBots().length).toBe(2);
        expect(service.getIdleQueue()).toEqual([firstBot.id, secondBot.id]);

        service.removeNewestBot();

        let bots = service.getBots();
        expect(bots.length).toBe(1);
        expect(bots?.[0]).toEqual(firstBot);
        expect(service.getIdleQueue()).toEqual([firstBot.id]);

        const thirdBot = service.addBot();
        expect(service.getBots().length).toBe(2);
        expect(service.getIdleQueue()).toEqual([firstBot.id, thirdBot.id]);

        service.removeNewestBot();
        bots = service.getBots();
        expect(bots.length).toBe(1);
        expect(bots?.[0]).toEqual(firstBot);
    });

    it('should return undefined if no idle bot is available', () => {
        const idleBot = service.getIdleBot();
        expect(idleBot).toBeUndefined();
    });

    it('should check if there is an idle bot', () => {
        expect(service.hasIdleBot()).toBe(false);
        service.addBot();
        expect(service.hasIdleBot()).toBe(true);
    });

    it('should get an idle bot in sequence', () => {
        const firstBot = service.addBot();
        const secondBot = service.addBot();
        expect(service.hasIdleBot()).toBe(true);
        expect(service.getIdleQueue()).toEqual([1, 2]);

        let idleBot = service.getIdleBot();
        expect(idleBot).toEqual(firstBot);
        expect(idleBot?.status).toBe('IDLE');

        idleBot = service.getIdleBot();
        expect(idleBot).toEqual(secondBot);
        expect(idleBot?.status).toBe('IDLE');
    });

    it('should get all bots', () => {
        service.addBot();
        service.addBot();
        const bots = service.getBots();
        expect(bots.length).toBe(2);
        expect(bots[0].status).toBe('IDLE');
        expect(bots[1].status).toBe('IDLE');
    });

    it('should assign order to bot and mark bot as busy, then complete job after timeout', () => {
        const bot = service.addBot();
        const order = orderService.addNormalOrder();

        const emitSpy = jest.spyOn(eventEmitter, 'emit');

        service.assignOrder(bot, order);

        // immediately after assigning
        expect(bot.status).toBe('BUSY');
        expect(bot.currentOrder).toBe(order);
        expect(bot.currentOrder?.botId).toBe(bot.id);
        expect(bot.currentOrder?.processStartAt).toBeInstanceOf(Date);

        expect(emitSpy).not.toHaveBeenCalledWith('order.complete');
        expect(emitSpy).not.toHaveBeenCalledWith('bot.idle');

        // fast-forward time
        jest.advanceTimersByTime(10000);

        expect(emitSpy).toHaveBeenCalledWith('order.complete', {
            ...order,
            botId: bot.id,
            processStartAt: expect.any(Date),
        });

        // after timeout
        expect(bot.status).toBe('IDLE');
        expect(bot.currentOrder).toBeUndefined();

        const eventSequence = emitSpy.mock.calls.map(
            ([eventName]) => eventName,
        );
        expect(eventSequence).toEqual(['order.complete', 'bot.idle']);
    });
});
