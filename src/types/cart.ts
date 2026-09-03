import { Brand, Image, Product, ProductVariant } from "@prisma/client";

export type ReqCartItemT = {
    productVariantId: number;
    quantity: number;
}

export type EnrichCartItemQueryDataT = Pick<
    ProductVariant,
    "id" |
    "slug" |
    "size" |
    "price" |
    "discount" |
    "stock" |
    "reserved"
> & {
    images: Pick<Image, "path">[];
    quantity: number;
} & {
    product: Pick<
        Product,
        "id" |
        "name" |
        "slug" |
        "isLimited" |
        "concentration"
    > & {
        brand: Pick<Brand, "name">
    }
}

export type CartItemT = {
    id: number;
    slug: string;
    price: number;
    discount: number;
    image: string | null;
    size: number;
    quantity: number;
    stock: number;
    reserved: number;
    product: {
        id: number;
        name: string;
        slug: string;
        brand: string;
        concentration: string;
        isLimited: boolean;
    }
}