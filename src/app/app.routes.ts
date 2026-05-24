import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard-guard';
import { RoleGuard } from './guards/role.guard-guard';
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
    canActivate:[AuthGuard,RoleGuard],
    loadComponent: () => 
        import('./pages/add-product/add-product').then(m => m.AddProduct)
   },
   {
    path: 'products/:id/edit',
    canActivate:[AuthGuard,RoleGuard],
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
    canActivate: [AuthGuard, RoleGuard],
    loadComponent: () =>
        import('./pages/add-customer/add-customer').then(m => m.AddCustomer)
   },
   {
    path: 'cart',
    canActivate: [AuthGuard],
    loadComponent: () =>
        import('./pages/cart/cart').then(m => m.Cart)
   },
   {
    path: 'orders/new',
    redirectTo: 'cart',
    pathMatch: 'full',
   },
   {
    path: 'orders/:id',
    canActivate:[AuthGuard,RoleGuard],
    loadComponent: () =>
        import('./pages/order-details/order-details').then(m => m.OrderDetails)
   },
   {
    path: 'orders',
    canActivate:[AuthGuard, RoleGuard],
    loadComponent: ()=>
        import('./pages/orders/orders').then(m=> m.Orders)
   },
   {
    path:'**',
    loadComponent: () => 
        import('./pages/not-found/not-found').then(m => m.NotFound)
   }
];
