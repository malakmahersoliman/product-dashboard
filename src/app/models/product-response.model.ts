import { Product } from "./product.model";

export interface ProductResponse{
    products: Product[];
    total: number;
    skip: number;
    limit: number;
}