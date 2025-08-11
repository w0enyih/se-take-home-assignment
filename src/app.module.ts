import { Module } from '@nestjs/common';
import { OrderModule } from './order/order.module';
import { CliService } from './cli/cli.service';
import { CliModule } from './cli/cli.module';

@Module({
  imports: [OrderModule, CliModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
