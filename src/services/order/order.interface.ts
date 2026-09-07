import { Order } from "@prisma/client";
import { CursorPaginationResultT, ServiceResponseT } from "../../types/common";
import {
  CreateOrderParams,
  ListAdminOrdersParams,
  ListOrderResultT,
  ListOrdersParams,
  MyOrderT,
  PlaceOrderParams,
  UpdateOrderParams,
} from "../../types/order";

export interface IAdminOrderService {
  listOrders(
    params: ListAdminOrdersParams,
  ): Promise<ServiceResponseT<ListOrderResultT>>;
  getOrderDetail(code: string): Promise<ServiceResponseT<Order>>;
  createOrder(params: CreateOrderParams): Promise<ServiceResponseT<Order>>;
  updateOrder(
    code: string,
    params: UpdateOrderParams,
  ): Promise<ServiceResponseT<Order>>;
}

export interface IOrderService {
  listMyOrders(
    userId: number,
    params: ListOrdersParams,
  ): Promise<ServiceResponseT<CursorPaginationResultT<MyOrderT>>>;
  cancelMyOrder(
    code: string,
    params: { cancelledReason: string },
  ): Promise<ServiceResponseT<Order>>;
  placeOrder(params: PlaceOrderParams): Promise<ServiceResponseT<Order>>;
}
