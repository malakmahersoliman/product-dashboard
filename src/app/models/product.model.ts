export interface Product {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  price: number;
  stock: number;
  isAvailable: boolean;
}

export interface CreateProductRequest {
  name: string;
  categoryId: number;
  price: number;
  stock: number;
  isAvailable: boolean;
}

export interface UpdateProductRequest {
  name: string;
  categoryId: number;
  price: number;
  stock: number;
  isAvailable: boolean;
}