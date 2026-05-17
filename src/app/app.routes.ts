import { Routes } from '@angular/router';

export const routes: Routes = [
    {
     path:'',
     redirectTo:'products',
     pathMatch:"full"
    },
    {
    path:'products',
    loadComponent: () =>
        import('./pages/products/products').then(m=>m.Products)
   },
   {
    path:'products/new',
    loadComponent: () => 
        import('./pages/add-product/add-product').then(m => m.AddProduct)
   },
   {
    path: 'products/:id',
    loadComponent: () => 
        import('./pages/product-details/product-details').then(m => m.ProductDetails)
   },
   {
    path:'about',
    loadComponent: () => 
        import('./pages/about/about').then(m=>m.About)
   },
   {
    path:'**',
    loadComponent: () => 
        import('./pages/not-found/not-found').then(m => m.NotFound)
   }
];
