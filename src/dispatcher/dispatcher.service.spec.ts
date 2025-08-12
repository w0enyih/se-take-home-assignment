import { Test, TestingModule } from '@nestjs/testing';
import { DispatcherService } from './dispatcher.service';
import { BotService } from 'src/bot/bot.service';
import { OrderService } from 'src/order/order.service';
import { Order } from 'src/order/order.dto';
import { Bot } from 'src/bot/bot.dto';

jest.setTimeout(180000); // 3 minutes
jest.useFakeTimers();

describe('DispatcherService', () => {
    let dispatcherService: DispatcherService;
    let orderService: OrderService;
    let botService: BotService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DispatcherService, BotService, OrderService],
        }).compile();

        orderService = module.get<OrderService>(OrderService);
        botService = module.get<BotService>(BotService);
        dispatcherService = module.get<DispatcherService>(DispatcherService);
    });

    const validateProcess = (
        expectedPendings: Order[],
        expectedProcessings: Order[],
        expectedCompleteds: Order[],
        expectedBot: Bot[],
    ): void => {
        const pendingOrders = orderService.getPendingOrders();
        expect(pendingOrders.length).toBe(expectedPendings.length);
        expect(pendingOrders).toEqual(expectedPendings);

        const completedOrders = orderService.getCompletedOrders();
        expect(completedOrders.length).toBe(expectedCompleteds.length);
        expect(completedOrders).toEqual(expectedCompleteds);

        const bots = botService.getBots();
        expect(bots.length).toBe(expectedBot.length);
        expect(bots).toEqual(expectedBot);

        const processingOrders = botService.getBusyBots();
        expect(processingOrders.length).toBe(expectedProcessings.length);
        expect(processingOrders.map((bot) => bot.currentOrder)).toEqual(
            expectedProcessings,
        );
    };

    it('should be dispatch order to a bot when available', () => {
        // add 1 normal and 1 VIP orders
        const order1 = orderService.addNormalOrder();
        const vipOrder1 = orderService.addVIPOrder();

        // validate initial state
        let expectedPendings = [vipOrder1, order1];
        let expectedProcessings = [];
        let expectedcompleteds = [];
        let expectedBots = [];
        validateProcess(
            expectedPendings,
            expectedProcessings,
            expectedcompleteds,
            expectedBots,
        );

        // add a bot
        const bot1 = botService.addBot();
        expectedPendings = [vipOrder1, order1];
        expectedProcessings = [];
        expectedcompleteds = [];
        expectedBots = [bot1];
        validateProcess(
            expectedPendings,
            expectedProcessings,
            expectedcompleteds,
            expectedBots,
        );

        dispatcherService.safeDispatchOrder();

        // bot1 processing vipOrder1
        expectedPendings = [order1];
        expectedProcessings = [vipOrder1];
        expectedcompleteds = [];
        expectedBots = [bot1];
        validateProcess(
            expectedPendings,
            expectedProcessings,
            expectedcompleteds,
            expectedBots,
        );

        dispatcherService.safeDispatchOrder();

        // bot1 still processing vipOrder1 and order1 is still pending
        expectedPendings = [order1];
        expectedProcessings = [vipOrder1];
        expectedcompleteds = [];
        expectedBots = [bot1];
        validateProcess(
            expectedPendings,
            expectedProcessings,
            expectedcompleteds,
            expectedBots,
        );

        // fast forward time to complete the job
        jest.advanceTimersByTime(10000);
        dispatcherService.safeDispatchOrder();

        // bot1 compeleted vipOrder1
        // bot1 processing order1
        expectedPendings = [];
        expectedProcessings = [order1];
        expectedcompleteds = [vipOrder1];
        expectedBots = [bot1];
        validateProcess(
            expectedPendings,
            expectedProcessings,
            expectedcompleteds,
            expectedBots,
        );

        // fast forward time to complete the job
        jest.advanceTimersByTime(10000);

        // bot1 compeleted order1
        expectedPendings = [];
        expectedProcessings = [];
        expectedcompleteds = [vipOrder1, order1];
        expectedBots = [bot1];
        validateProcess(
            expectedPendings,
            expectedProcessings,
            expectedcompleteds,
            expectedBots,
        );
    });

    it('should be dispatch order to mutlitple bot when available', () => {
        // add 2 normal and 2 VIP orders
        const order1 = orderService.addNormalOrder();
        const vipOrder1 = orderService.addVIPOrder();
        const order2 = orderService.addNormalOrder();
        const vipOrder2 = orderService.addVIPOrder();

        // validate initial state
        let expectedPendings = [vipOrder1, vipOrder2, order1, order2];
        let expectedProcessings = [];
        let expectedcompleteds = [];
        let expectedBots = [];
        validateProcess(
            expectedPendings,
            expectedProcessings,
            expectedcompleteds,
            expectedBots,
        );

        // add a bot
        const bot1 = botService.addBot();
        expectedPendings = [vipOrder1, vipOrder2, order1, order2];
        expectedProcessings = [];
        expectedcompleteds = [];
        expectedBots = [bot1];
        validateProcess(
            expectedPendings,
            expectedProcessings,
            expectedcompleteds,
            expectedBots,
        );

        dispatcherService.safeDispatchOrder();

        // bot1 processing vipOrder1
        expectedPendings = [vipOrder2, order1, order2];
        expectedProcessings = [vipOrder1];
        expectedcompleteds = [];
        expectedBots = [bot1];
        validateProcess(
            expectedPendings,
            expectedProcessings,
            expectedcompleteds,
            expectedBots,
        );

        // fast forward time to complete the job
        jest.advanceTimersByTime(10000);
        dispatcherService.safeDispatchOrder();

        // bot1 compeleted vipOrder1
        // bot1 processing vipOrder2
        expectedPendings = [order1, order2];
        expectedProcessings = [vipOrder2];
        expectedcompleteds = [vipOrder1];
        expectedBots = [bot1];
        validateProcess(
            expectedPendings,
            expectedProcessings,
            expectedcompleteds,
            expectedBots,
        );

        dispatcherService.safeDispatchOrder();

        // add delay
        jest.advanceTimersByTime(1000);

        // add another bot
        const bot2 = botService.addBot();
        dispatcherService.safeDispatchOrder();

        // bot1 processing vipOrder2
        // bot2 compeleted Order1
        expectedPendings = [order2];
        expectedProcessings = [vipOrder2, order1];
        expectedcompleteds = [vipOrder1];
        expectedBots = [bot1, bot2];
        validateProcess(
            expectedPendings,
            expectedProcessings,
            expectedcompleteds,
            expectedBots,
        );

        // add delay
        jest.advanceTimersByTime(1000);

        // add another bot
        const bot3 = botService.addBot();
        dispatcherService.safeDispatchOrder();

        // bot1 processing vipOrder2
        // bot2 processing Order1
        // bot3 processing Order2
        expectedPendings = [];
        expectedProcessings = [vipOrder2, order1, order2];
        expectedcompleteds = [vipOrder1];
        expectedBots = [bot1, bot2, bot3];
        validateProcess(
            expectedPendings,
            expectedProcessings,
            expectedcompleteds,
            expectedBots,
        );

        // fast forward time to complete the job
        jest.advanceTimersByTime(10000);

        // all bots completed their orders
        expectedPendings = [];
        expectedProcessings = [];
        expectedcompleteds = [vipOrder1, vipOrder2, order1, order2];
        expectedBots = [bot1, bot2, bot3];
        validateProcess(
            expectedPendings,
            expectedProcessings,
            expectedcompleteds,
            expectedBots,
        );
    });

    it('should returns orders to queue when bot removed', () => {
        // add 1 normal and 1 VIP orders
        const order1 = orderService.addNormalOrder();
        const vipOrder1 = orderService.addVIPOrder();
        const vipOrder2 = orderService.addVIPOrder();

        // add 2 bots
        const bot1 = botService.addBot();
        const bot2 = botService.addBot();

        // validate initial state
        let expectedPendings = [vipOrder1, vipOrder2, order1];
        let expectedProcessings = [];
        let expectedcompleteds = [];
        let expectedBots = [bot1, bot2];
        validateProcess(
            expectedPendings,
            expectedProcessings,
            expectedcompleteds,
            expectedBots,
        );

        dispatcherService.safeDispatchOrder();

        // validate initial state
        expectedPendings = [order1];
        expectedProcessings = [vipOrder1, vipOrder2];
        expectedcompleteds = [];
        expectedBots = [bot1, bot2];
        validateProcess(
            expectedPendings,
            expectedProcessings,
            expectedcompleteds,
            expectedBots,
        );

        // remove the newest bot - bot2
        const removedBot = botService.removeNewestBot();
        expect(removedBot?.id).toEqual(bot2?.id);

        // vipOrder1 should be requeued
        expectedPendings = [vipOrder2, order1];
        expectedProcessings = [vipOrder1];
        expectedcompleteds = [];
        expectedBots = [bot1];
        validateProcess(
            expectedPendings,
            expectedProcessings,
            expectedcompleteds,
            expectedBots,
        );

        // add new bot to process the requeued order
        const bot3 = botService.addBot();
        dispatcherService.safeDispatchOrder();

        // bot2 processing vipOrder2
        // bot3 processing vipOrder1
        expectedPendings = [order1];
        expectedProcessings = [vipOrder1, vipOrder2];
        expectedcompleteds = [];
        expectedBots = [bot1, bot3];
        validateProcess(
            expectedPendings,
            expectedProcessings,
            expectedcompleteds,
            expectedBots,
        );

        // fast forward time to complete the job
        jest.advanceTimersByTime(10000);

        expectedPendings = [order1];
        expectedProcessings = [];
        expectedcompleteds = [vipOrder1, vipOrder2];
        expectedBots = [bot1, bot3];
        validateProcess(
            expectedPendings,
            expectedProcessings,
            expectedcompleteds,
            expectedBots,
        );
    });
});
