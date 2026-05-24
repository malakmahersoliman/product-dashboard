import { Component, ChangeDetectorRef, effect } from '@angular/core';
import { RouterLink, RouterLinkActive , Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  constructor(
   public authService: AuthService,
   public cartService: CartService,
   private router: Router,
   private cdr: ChangeDetectorRef
  ) {
    effect(() => {
      this.cartService.itemCount();
      this.cdr.markForCheck();
    });
  }
  logout(): void{
    this.cartService.clear();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  
}
