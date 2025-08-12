import { Module } from '@nestjs/common';
import { DispatcherService } from './dispatcher.service';
import { BotModule } from 'src/bot/bot.module';
import { OrderModule } from 'src/order/order.module';

@Module({
    imports: [BotModule, OrderModule],
    providers: [DispatcherService],
    exports: [DispatcherService],
})
export class DispatcherModule {}
