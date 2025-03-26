import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('OrdersService')

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected')
  }

  create(createOrderDto: CreateOrderDto) {
    return this.order.create({ data: createOrderDto })
  }

  async findAll(orderPaginationDto: OrderPaginationDto) {
    const { page, limit, status } = orderPaginationDto

    const records = await this.order.count({ where: { status } })
    const lastPage = Math.ceil(records / limit)

    return {
      data: await this.order.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { status }
      }),
      meta: {
        page,
        records,
        lastPage
      }
    }
  }

  async findOne(id: string) {
    const order = await this.order.findUnique({
      where: { id }
    });

    if (!order) throw new RpcException({
      message: `Product with id #${id} not found`,
      status: HttpStatus.NOT_FOUND
    });

    return order;
  }

  async changeStatus(changeOrderStatusDto: ChangeOrderStatusDto) {

    const {id, status} = changeOrderStatusDto

    const order = await this.findOne(id)

    if(order.status === status) return order;

    return this.order.update({
      where: {id},
      data: {status}
    })
  }
}
