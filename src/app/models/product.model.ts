export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  isAvailable: boolean;
}

export interface CreateProductRequest {
  name: string;
  category: string;
  price: number;
  stock: number;
  isAvailable: boolean;
}

export interface UpdateProductRequest {
  name: string;
  category: string;
  price: number;
  stock: number;
  isAvailable: boolean;
}