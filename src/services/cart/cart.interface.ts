import { ServiceResponseT } from "../../types/common";
import { ReqCartItemT, CartItemT } from "../../types/cart";

export interface ICartService {
    listCartItems(params: { items: ReqCartItemT[] }): Promise<ServiceResponseT<CartItemT[]>>;
}