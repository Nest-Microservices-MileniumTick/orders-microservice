import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ENV } from 'src/config';
import { PRODUCT_SERVICE } from 'src/config/service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [
    ClientsModule.register([
      {
        name: PRODUCT_SERVICE,
        transport: Transport.TCP,
        options: {
          host: ENV.PRODUCTS_MICROSERVICE_HOST,
          port: ENV.PRODUCTS_MICROSERVICE_PORT
        }
      }
    ])
  ]
})
export class OrdersModule {}
