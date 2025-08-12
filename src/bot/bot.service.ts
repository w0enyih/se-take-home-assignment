import { Injectable } from '@nestjs/common';
import { Bot, BotStatus } from './bot.dto';
import { OrderService } from 'src/order/order.service';
import { Queue } from 'src/common/queue';
import { Order } from 'src/order/order.dto';
import { FileLogger } from 'src/common/fileLogger';

@Injectable()
export class BotService {
    private bots: Map<number, Bot> = new Map();
    private botIdCounter: number = 1;
    private readonly processTimeInMS = 10000;
    private readonly logger = new FileLogger('Bot');

    // idle queue holds the bot id for assigning order to idle bots
    private idleQueue: Queue<number> = new Queue<number>();

    constructor(private readonly orderService: OrderService) {}

    addBot(): Bot {
        const bot: Bot = {
            id: this.botIdCounter++,
            status: BotStatus.IDLE,
        };

        this.bots.set(bot.id, bot);
        this.idleQueue.enqueue(bot.id);
        this.logger.log(`Added new bot ${bot.id}`);
        return bot;
    }

    removeNewestBot(): Bot | undefined {
        if (this.bots.size === 0) {
            return undefined;
        }

        const newestBotId = Math.max(...this.bots.keys());
        const newestBot = this.bots.get(newestBotId);

        if (!newestBot) {
            return undefined;
        }

        if (newestBot.timeout) {
            clearTimeout(newestBot.timeout);
        }

        this.bots.delete(newestBotId);
        this.idleQueue.delete(newestBotId);

        if (newestBot.currentOrder) {
            this.orderService.requeueOrder(newestBot.currentOrder);
        }
        this.logger.log(`Deleted bot${newestBotId}`);
        return newestBot;
    }

    assignOrder(bot: Bot, order: Order) {
        bot.currentOrder = order;
        bot.currentOrder.botId = bot.id;
        bot.currentOrder.processStartAt = new Date();
        bot.status = BotStatus.BUSY;
        this.logger.log(`Assigned order #${order.id} to bot ${bot.id}`);

        bot.timeout = setTimeout(() => {
            this.onJobComplete(bot);
        }, this.processTimeInMS);
    }

    onJobComplete(bot: Bot): void {
        if (bot.currentOrder) {
            this.orderService.completeOrder(bot.currentOrder);
        }

        bot.currentOrder = undefined;
        bot.status = BotStatus.IDLE;
        bot.timeout = undefined;
        this.idleQueue.enqueue(bot.id);
    }

    getBots(): Bot[] {
        return Array.from(this.bots.values());
    }

    hasIdleBot(): boolean {
        return !this.idleQueue.isEmpty();
    }

    getIdleBot(): Bot | undefined {
        if (!this.idleQueue.isEmpty()) {
            const botId = this.idleQueue.dequeue();
            if (typeof botId === 'number') {
                return this.bots.get(botId);
            }
        }
        return undefined;
    }

    getIdleQueue(): number[] {
        return this.idleQueue.getAll();
    }

    getBusyBots(): Bot[] {
        return Array.from(this.bots.values()).filter(
            (bot) => bot.status === BotStatus.BUSY,
        );
    }
}
