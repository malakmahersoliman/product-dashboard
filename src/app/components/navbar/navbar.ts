import { Component, ChangeDetectorRef, effect, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit, OnDestroy {
  showShell = false;
  sidebarOpen = false;

  private routerSub?: Subscription;

  constructor(
    public authService: AuthService,
    public cartService: CartService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    effect(() => {
      this.cartService.itemCount();
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    this.updateShellVisibility();

    this.routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.sidebarOpen = false;
        this.updateShellVisibility();
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  logout(): void {
    this.cartService.clear();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  private updateShellVisibility(): void {
    const leafPath = this.getLeafRoutePath();
    const isPublicRoute = leafPath === 'login' || leafPath === '**';

    this.showShell = this.authService.isLoggedIn() && !isPublicRoute;
    this.cdr.markForCheck();
  }

  private getLeafRoutePath(): string | undefined {
    let route = this.router.routerState.root;

    while (route.firstChild) {
      route = route.firstChild;
    }

    return route.routeConfig?.path;
  }
}
