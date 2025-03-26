import { OrderStatus } from "@prisma/client"
import { IsEnum, IsNumber, IsOptional, IsPositive } from "class-validator"
import { OrderStatusList } from "../enum/order.enum"

export class CreateOrderDto {

  @IsNumber()
  @IsPositive()
  totalAmount: number

  @IsNumber()
  @IsPositive()
  totalItems:number

  @IsEnum(OrderStatusList, {
    message: `Status values are ${OrderStatusList}`
  })
  @IsOptional()
  status: OrderStatus = OrderStatus.PENDING
}
