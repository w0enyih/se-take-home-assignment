import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { BotService } from 'src/bot/bot.service';
import { FileLogger } from 'src/common/fileLogger';
import { OrderService } from 'src/order/order.service';

@Injectable()
export class DispatcherService {
    private isRunning: boolean = false;
    private readonly logger = new FileLogger('Dispatcher');

    constructor(
        private readonly orderService: OrderService,
        private readonly botService: BotService,
    ) {}

    @OnEvent('bot.added')
    @OnEvent('bot.idle')
    @OnEvent('order.created')
    @OnEvent('order.requeued')
    handleTriggerDispatch(): void {
        return this.safeDispatchOrder();
    }

    safeDispatchOrder(): void {
        // Prevent multiple dispatches at the same time
        if (this.isRunning) {
            return;
        }

        this.isRunning = true;

        try {
            this.dispatchOrders();
        } catch (error) {
            this.logger.error('Error during order dispatch:', String(error));
        } finally {
            this.isRunning = false;
        }
    }

    dispatchOrders(): void {
        while (true) {
            // check if there are pending orders
            const hasPendingOrder = this.orderService.hasPendingOrder();

            if (!hasPendingOrder) {
                return;
            }

            // check if there are idle bots
            const hasIdleBot = this.botService.hasIdleBot();

            if (!hasIdleBot) {
                return;
            }

            // get an idle bot to assign the order
            const idleBot = this.botService.getIdleBot();
            if (!idleBot) {
                return;
            }

            // get the next order to dispatch
            const nextOrder = this.orderService.getNextOrder();
            if (!nextOrder) {
                return;
            }

            // assign the next order to the idle bot
            this.botService.assignOrder(idleBot, nextOrder);
        }
    }
}
