import { prisma } from "../../lib/prisma";
import { CartDto } from "../../dtos/cart.dto";
import { ServiceResponseT } from "../../types/common";
import { ReqCartItemT, CartItemT, EnrichCartItemQueryDataT } from "../../types/cart";
import { ICartService } from "./cart.interface";

export class CartService implements ICartService {
    async listCartItems({ items }: { items: ReqCartItemT[] }): Promise<ServiceResponseT<CartItemT[]>> {
        const normalizedItems = Object.values(
            items.reduce<
                Record<
                    string,
                    {
                        productVariantId: number;
                        quantity: number;
                    }
                >
            >((acc, item) => {
                const existing = acc[item.productVariantId];

                if (existing) {
                    existing.quantity += item.quantity;
                } else {
                    acc[item.productVariantId] = {
                        productVariantId: item.productVariantId,
                        quantity: item.quantity,
                    };
                }

                return acc;
            }, {})
        );

        const productVariantIds = normalizedItems.map((item) => item.productVariantId);

        const variants = await prisma.productVariant.findMany({
            where: {
                id: {
                    in: productVariantIds
                },
                isActive: true,
                deletedAt: null,
                stock: {
                    gt: 0
                }
            },
            select: {
                id: true,
                slug: true,
                size: true,
                price: true,
                discount: true,
                stock: true,
                reserved: true,
                images: {
                    take: 1,
                    where: {
                        isPrimary: true,
                    },
                    select: {
                        path: true,
                    }
                },
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        concentration: true,
                        isLimited: true,
                        brand: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
            }
        });

        const quantityMap = new Map<number, number>();

        for (const item of normalizedItems) {
            quantityMap.set(item.productVariantId, item.quantity);
        }

        const resultItems = variants.reduce((acc, variant) => {
            const quantity = quantityMap.get(variant.id) ?? 1;

            if (quantity > variant.stock - variant.reserved) {
                acc.push({
                    ...variant,
                    quantity: variant.stock - variant.reserved,
                })
            } else {
                acc.push({
                    ...variant,
                    quantity,
                })
            }

            return acc;
        }, [] as EnrichCartItemQueryDataT[])

        return {
            success: true,
            message: "Fetched cart items successfully.",
            data: resultItems.map(CartDto.toCartItem),
        };
    }
}