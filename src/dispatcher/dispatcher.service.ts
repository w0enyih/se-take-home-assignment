import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
        private readonly configService: ConfigService,
    ) {}

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
            this.botService.assignOrder(idleBot, nextOrder, () =>
                this.safeDispatchOrder(),
            );
        }
    }

    async executeAndDispatch<T>(
        fn: () => T | Promise<T>,
    ): Promise<T | undefined> {
        try {
            const result = await Promise.resolve(fn()); // handles sync or async fn
            this.safeDispatchOrder();
            return result;
        } catch (err) {
            if (err instanceof Error) {
                this.logger.error('An error occurred:', err.message);
            } else {
                this.logger.error('An unexpected error occurred:', String(err));
            }
            return undefined;
        }
    }
}
