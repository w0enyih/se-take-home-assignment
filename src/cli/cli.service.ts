import { Injectable } from '@nestjs/common';
import inquirer from 'inquirer';
import { OrderService } from 'src/order/order.service';

@Injectable()
export class CliService {
    constructor(
        private readonly orderService: OrderService,
    ) {
        this.menu();
    }

    async menu() {
        const action = await this.getAnswer();

        switch (action) {
            case 'New Normal Order':
                this.orderService.addNormalOrder();
                break;
            case 'New VIP Order':
                this.orderService.addVIPOrder();
                break;
            case 'Display':
                break;
            case 'Exit':
                process.exit(0);
        }

        this.showStatus();
        this.menu();
    }

    async getAnswer() {
        try {
            const { action } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'action',
                    message: 'What would you like to do?',
                    choices: [
                        'New Normal Order',
                        'New VIP Order',
                        new inquirer.Separator(),
                        '+ Bot',
                        '- Bot',
                        new inquirer.Separator(),
                        'Exit',
                    ],
                },
            ]);

            return action;
        } catch (err) {
            if (err?.name === 'ExitPromptError') {
                console.log('Prompt aborted by user (Ctrl+C). Exiting gracefully.');
                process.exit(0);
            } else {
                console.error('An unexpected error occurred:', err);
            }
        }
    }

    showStatus() {
        const pending = this.orderService.getPendingOrders();
        const completed = this.orderService.getCompletedOrders();

        console.clear();
        console.log('========================================');
        console.log('       ORDER PROCESSING SYSTEM          ');
        console.log('========================================');
        console.log('\n--- STATUS ---');

        console.log('\n🟡 PENDING ORDERS:');
        if (pending.length === 0) {
            console.log('  (none)');
        } else {
            console.table(pending, ['id', 'type']);
        }

        console.log('\n✅ COMPLETED ORDERS:');
        if (completed.length === 0) {
            console.log('  (none)');
        } else {
            console.table(completed, ['id', 'type']);
        }

        console.log('\n');
    }
}
