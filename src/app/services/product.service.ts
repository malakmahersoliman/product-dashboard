import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProductResponse } from '../models/product-response.model';
import { Product } from '../models/product.model';
import { Observable } from 'rxjs';





@Injectable({
  providedIn: 'root',
})



export class ProductService {
    private http = inject(HttpClient);
    private readonly apiUrl = 'https://dummyjson.com/products';
  //   private products: Product[] = [
  //     {
  //       id: 1,
  //       title: 'Essence Mascara Lash Princess',
  //       description:
  //         'The Essence Mascara Lash Princess is a popular mascara known for its volumizing and lengthening effects.',
  //       category: 'beauty',
  //       price: 9.99,
  //       discountPercentage: 10.48,
  //       rating: 2.56,
  //       stock: 99,
  //       tags: ['beauty', 'mascara'],
  //       brand: 'Essence',
  //       images: [
  //         'https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/1.webp',
  //       ],
  //       thumbnail:
  //         'https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp',
  //     },
  //     {
  //       id: 2,
  //       title: 'Eyeshadow Palette with Mirror',
  //       description:
  //         'The Eyeshadow Palette with Mirror offers a versatile range of eyeshadow shades for creating stunning eye looks.',
  //       category: 'beauty',
  //       price: 19.99,
  //       discountPercentage: 18.19,
  //       rating: 2.86,
  //       stock: 34,
  //       tags: ['beauty', 'eyeshadow'],
  //       brand: 'Glamour Beauty',
  //       images: [
  //         'https://cdn.dummyjson.com/product-images/beauty/eyeshadow-palette-with-mirror/1.webp',
  //       ],
  //       thumbnail:
  //         'https://cdn.dummyjson.com/product-images/beauty/eyeshadow-palette-with-mirror/thumbnail.webp',
  //     },
  //     {
  //       id: 3,
  //       title: 'Powder Canister',
  //       description:
  //         'The Powder Canister is a finely milled setting powder designed to set makeup and control shine.',
  //       category: 'beauty',
  //       price: 14.99,
  //       discountPercentage: 9.84,
  //       rating: 4.64,
  //       stock: 89,
  //       tags: ['beauty', 'face powder'],
  //       brand: 'Velvet Touch',
  //       images: [
  //         'https://cdn.dummyjson.com/product-images/beauty/powder-canister/1.webp',
  //       ],
  //       thumbnail:
  //         'https://cdn.dummyjson.com/product-images/beauty/powder-canister/thumbnail.webp',
  //     },
  //   ];
  //   public getProducts(): Product[] {
  //   return this.products;
  // }
      getProductsFromApi(): Observable<ProductResponse> {
        return this.http.get<ProductResponse>(this.apiUrl);
      }
      getProductById(id: number): Observable<Product> {
        return this.http.get<Product>(`${this.apiUrl}/${id}`);
      }
      addProduct(productData: Partial<Product>): Observable<Product> {
        return this.http.post<Product>(`${this.apiUrl}/add`, productData);
      }

}
