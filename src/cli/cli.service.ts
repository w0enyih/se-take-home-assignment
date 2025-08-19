import { Injectable } from '@nestjs/common';
import inquirer from 'inquirer';
import { isFunction } from 'rxjs/internal/util/isFunction';
import { BotService } from 'src/bot/bot.service';
import { FileLogger } from 'src/common/fileLogger';
import { DispatcherService } from 'src/dispatcher/dispatcher.service';
import { OrderService } from 'src/order/order.service';

@Injectable()
export class CliService {
    private readonly logger = new FileLogger(`Order`);

    private readonly menuOptions = [
        'Display',
        'New Normal Order',
        'New VIP Order',
        '+ Bot',
        '- Bot',
        'Exit',
    ];

    constructor(
        private readonly orderService: OrderService,
        private readonly botService: BotService,
        private readonly dispatcherService: DispatcherService,
    ) {
        this.logger.log(`CLI app started`);
        this.menu();
    }

    async menu() {
        console.log('--- MAIN MENU ---');
        const action = await this.getAnswer();
        let execFunction: (() => void) | undefined;

        switch (action) {
            case 'New Normal Order':
                execFunction = () => {
                    this.orderService.addNormalOrder();
                };
                break;
            case 'New VIP Order':
                execFunction = () => {
                    this.orderService.addVIPOrder();
                };
                break;
            case '+ Bot':
                execFunction = () => {
                    this.botService.addBot();
                };
                break;
            case '- Bot':
                execFunction = () => {
                    this.botService.removeNewestBot();
                };
                break;
            case 'Display':
                break;
            case 'Exit':
                process.exit(0);
        }

        if (execFunction && isFunction(execFunction)) {
            await this.dispatcherService.executeAndDispatch(execFunction);
        }

        this.displayStatus();
        this.menu();
    }

    async getAnswer(): Promise<string | undefined> {
        try {
            const { action } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'action',
                    message: 'What would you like to do?',
                    choices: this.menuOptions,
                },
            ]);

            return action;
        } catch (err) {
            if ((err as Error)?.name === 'ExitPromptError') {
                console.log(
                    'Prompt aborted by user (Ctrl+C). Exiting gracefully.',
                );
                process.exit(0);
            } else {
                console.error('An unexpected error occurred:', err);
            }
        }

        return undefined;
    }

    displayStatus() {
        const pending = this.orderService.getPendingOrders();
        const completed = this.orderService.getCompletedOrders();

        console.log('========================================');
        console.log(new Date().toISOString());

        console.log('\n🟡 PENDING ORDERS:');
        if (pending.length === 0) {
            console.log('  (none)');
        } else {
            console.table(pending, ['id', 'type', 'createdAt']);
        }

        console.log('\n🟢 COMPLETED ORDERS:');
        if (completed.length === 0) {
            console.log('  (none)');
        } else {
            console.table(completed, [
                'id',
                'type',
                'botId',
                'createdAt',
                'processStartAt',
                'processEndAt',
            ]);
        }

        console.log('\nBOTS:');
        const bots = this.botService.getBots();
        if (bots.length === 0) {
            console.log('  (none)');
        } else {
            // busy bots are shown first
            bots.sort((a, b) => {
                if (a.status === b.status) return 0;
                return a.status === 'BUSY' ? -1 : 1;
            });

            console.table(
                bots.map((bot) => ({
                    id: bot.id,
                    status: bot.status,
                    orderId: bot?.currentOrder?.id,
                    orderType: bot?.currentOrder?.type,
                    orderProcessStartAt: bot?.currentOrder?.processStartAt,
                    orderProcessingTimeInMS: bot?.currentOrder?.processingTimeInMS,
                })),
            );
        }

        console.log('\n');
        console.log('========================================\n');
    }
}
