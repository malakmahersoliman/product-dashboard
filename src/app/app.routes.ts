import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard-guard';

export const routes: Routes = [
    {
     path:'',
     redirectTo:'login',
     pathMatch:"full"
    },
    {
        path: 'login',
        loadComponent: () => 
            import('./pages/login/login').then(m => m.Login)

    },
    {
    path:'products',
    canActivate:[AuthGuard],
    loadComponent: () =>
        import('./pages/products/products').then(m=>m.Products)
   },
   {
    path:'products/new',
    canActivate:[AuthGuard],
    loadComponent: () => 
        import('./pages/add-product/add-product').then(m => m.AddProduct)
   },
   {
    path: 'products/:id/edit',
    canActivate:[AuthGuard],
    loadComponent: () =>
        import('./pages/edit-product/edit-product').then(m => m.EditProduct)
   },
   {
    path: 'products/:id',
    canActivate:[AuthGuard],
    loadComponent: () => 
        import('./pages/product-details/product-details').then(m => m.ProductDetails)
   },
   {
    path: 'customers',
    canActivate:[AuthGuard],
    loadComponent: () =>
        import('./pages/customers/customers').then(m => m.Customers)
   },
   {
    path: 'customers/new',
    canActivate:[AuthGuard],
    loadComponent: () =>
        import('./pages/add-customer/add-customer').then(m => m.AddCustomer)
   },
     {
    path: 'orders/new',
    canActivate:[AuthGuard],
    loadComponent: ()=> 
        import('./pages/add-order/add-order').then(m => m.AddOrder)
   },
   {
    path: 'orders/:id',
    canActivate:[AuthGuard],
    loadComponent: () =>
        import('./pages/order-details/order-details').then(m => m.OrderDetails)
   },
   {
    path: 'orders',
    canActivate:[AuthGuard],
    loadComponent: ()=>
        import('./pages/orders/orders').then(m=> m.Orders)
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
