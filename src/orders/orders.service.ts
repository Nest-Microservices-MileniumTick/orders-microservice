import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaClient } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';
import { PRODUCT_SERVICE } from 'src/config/service';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('OrdersService');

  @Inject(PRODUCT_SERVICE)
  private readonly productsClient: ClientProxy;

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  async create(createOrderDto: CreateOrderDto) {
    const ids = createOrderDto.items.map((item) => item.productId);

    const products: any[] = await firstValueFrom(
      this.productsClient.send({ cmd: 'validate_products' }, { ids }).pipe(
        catchError((err) => {
          throw new RpcException(err);
        }),
      ),
    );

    let totalItems = 0;
    let totalAmount = 0;

    for (const orderItem of createOrderDto.items) {
      totalItems += orderItem.quantity;

      const price = products.find(
        (product) => product.id === orderItem.productId,
      )?.price;

      totalAmount += price * orderItem.quantity;
    }

    const order = await this.order.create({
      data: {
        totalAmount,
        totalItems,
        orderItems: {
          createMany: {
            data: products.map((product) => ({
              productId: +product.id || 0,
              quantity:
                createOrderDto.items.find(
                  (item) => item.productId === product.id,
                )?.quantity || 0,
              price: +product.price || 0,
            })),
          },
        },
      },
      include: {
        orderItems: {
          select: {
            productId: true,
            quantity: true,
            price: true,
          },
        },
      },
    });

    return {
      ...order,
      orderItems: order.orderItems.map((orderItem) => ({
        ...orderItem,
        name: products.find((product) => product.id === orderItem.productId)
          .name,
      })),
    };
  }

  async findAll(orderPaginationDto: OrderPaginationDto) {
    const { page, limit, status } = orderPaginationDto;

    const records = await this.order.count({ where: { status } });
    const lastPage = Math.ceil(records / limit);

    return {
      data: await this.order.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { status },
      }),
      meta: {
        page,
        records,
        lastPage,
      },
    };
  }

  async findOne(id: string) {
    const order = await this.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          select: {
            productId: true,
            quantity: true,
            price: true,
          },
        },
      },
    });

    if (!order)
      throw new RpcException({
        message: `Product with id #${id} not found`,
        status: HttpStatus.NOT_FOUND,
      });

    const ids = order.orderItems.map((item) => item.productId);

    const products: any[] = await firstValueFrom(
      this.productsClient.send({ cmd: 'validate_products' }, { ids }).pipe(
        catchError((err) => {
          throw new RpcException(err);
        }),
      ),
    );

    return {
      ...order,
      orderItems: order.orderItems.map((orderItem) => ({
        ...orderItem,
        name: products.find((product) => product.id === orderItem.productId)
          .name,
      })),
    };
  }

  async changeStatus(changeOrderStatusDto: ChangeOrderStatusDto) {
    const { id, status } = changeOrderStatusDto;

    const order = await this.findOne(id);

    if (order.status === status) return order;

    return this.order.update({
      where: { id },
      data: { status },
    });
  }
}
