import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { OrderModule } from 'src/order/order.module';

@Module({
    imports: [OrderModule],
    providers: [BotService],
    exports: [BotService],
})
export class BotModule {}
