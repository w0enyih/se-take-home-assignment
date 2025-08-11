import { Module } from '@nestjs/common';
import { CliService } from './cli.service';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [OrderModule],
  providers: [CliService],
})
export class CliModule {}