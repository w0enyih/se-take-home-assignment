import { Module } from '@nestjs/common';
import { OrderModule } from '../order/order.module';
import { BotModule } from 'src/bot/bot.module';
import { DispatcherModule } from 'src/dispatcher/dispatcher.module';
import { CliService } from './cli.service';
import { ConfigModule } from '@nestjs/config';
import configuration from 'config/configuration';

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [configuration],
            isGlobal: true,
        }),
        OrderModule,
        BotModule,
        DispatcherModule,
    ],
    providers: [CliService],
})
export class CliModule {}
