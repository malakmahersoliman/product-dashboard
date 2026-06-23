export interface Product {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  price: number;
  stock: number;
  isAvailable: boolean;
  imagePath?: string | null;
}

export interface CreateProductRequest {
  name: string;
  categoryId: number;
  price: number;
  stock: number;
  isAvailable: boolean;
  imagePath?: string | null;
}

export interface UpdateProductRequest {
  name: string;
  categoryId: number;
  price: number;
  stock: number;
  isAvailable: boolean;

}
export interface ProductFilterParams {
  search?: string;
  categoryId?: number | null;
  isAvailable?: boolean | null;
  stockStatus?: string;
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: string;
}