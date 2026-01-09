import { OrderStatus, PaymentStatus } from "@prisma/client";

export type ListOrdersParams = {
  pageSize: number;
  offset: number;
  search?: string | undefined;
  status?: OrderStatus | undefined;
  paymentStatus?: PaymentStatus | undefined;
  userId?: number | undefined;
};

export type CreateOrderParams = {
  totalPrice: number | string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerNotes?: string;
  products: Array<{
    productId: number | string;
    quantity: number | string;
    price: number | string;
  }>;
  userId?: number | string;
  authenticatedUserId?: number;
};

export type UpdateOrderParams = {
  totalPrice?: number | string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerNotes?: string;
  rejectedReason?: string;
  products?: Array<{
    productId: number | string;
    quantity: number | string;
    price: number | string;
  }>;
  userId?: number | string;
};

export type ParseOrderQueryParamsResult = {
  pageSize: number;
  offset: number;
  search?: string | undefined;
  status?: OrderStatus | undefined;
  paymentStatus?: PaymentStatus | undefined;
  userId?: number | undefined;
};
