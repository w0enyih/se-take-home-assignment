import { Test, TestingModule } from '@nestjs/testing';
import { BotService } from './bot.service';
import { OrderService } from '../order/order.service';

describe('BotService', () => {
    let service: BotService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [BotService, OrderService],
        }).compile();

        service = module.get<BotService>(BotService);
    });

    // for debugging purposes
    // afterEach(() => {
    //     console.log(`Bots`, service.getBots());
    //     console.log(`IdleQueue:`, service.getIdleQueue());
    // });

    it('should add a bot', () => {
        const bot = service.addBot();
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
});
