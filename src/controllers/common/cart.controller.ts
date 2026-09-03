import { CustomRequest } from "../../types/common";
import { NextFunction, Response } from "express";
import { CartService } from "../../services/cart/cart.service";

const cartService = new CartService();

export const listCartItems = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await cartService.listCartItems(req.body);

        return res.status(200).json(result);
    } catch (error: any) {
        next(error);
    }
}