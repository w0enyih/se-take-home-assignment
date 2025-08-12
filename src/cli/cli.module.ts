import { Module } from '@nestjs/common';
import { OrderModule } from '../order/order.module';
import { BotModule } from 'src/bot/bot.module';
import { DispatcherModule } from 'src/dispatcher/dispatcher.module';
import { CliService } from './cli.service';

@Module({
    imports: [OrderModule, BotModule, DispatcherModule],
    providers: [CliService],
})
export class CliModule {}
