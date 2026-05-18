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
    path: 'products/:id/edit',
    loadComponent: () =>
        import('./pages/edit-product/edit-product').then(m => m.EditProduct)
   },
   {
    path: 'products/:id',
    loadComponent: () => 
        import('./pages/product-details/product-details').then(m => m.ProductDetails)
   },
   {
    path: 'customers',
    loadComponent: () =>
        import('./pages/customers/customers').then(m => m.Customers)
   },
   {
    path: 'customers/new',
    loadComponent: () =>
        import('./pages/add-customer/add-customer').then(m => m.AddCustomer)
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
