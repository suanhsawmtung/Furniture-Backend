import { EnrichCartItemQueryDataT, CartItemT } from "../types/cart";

export class CartDto {
    static toCartItem(cart: EnrichCartItemQueryDataT): CartItemT {
        return {
            id: cart.id,
            slug: cart.slug,
            price: Number(cart.price),
            discount: Number(cart.discount),
            size: cart.size,
            stock: cart.stock,
            reserved: cart.reserved,
            quantity: cart.quantity,
            image: cart.images[0]?.path || null,
            product: {
                id: cart.product.id,
                name: cart.product.name,
                slug: cart.product.slug,
                brand: cart.product.brand.name,
                isLimited: cart.product.isLimited,
                concentration: cart.product.concentration
            }
        }
    }
}
