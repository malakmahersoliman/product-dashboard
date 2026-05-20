import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive , Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  // authService = inject(AuthService);
  // private router = inject(Router);
  constructor(
   public authService: AuthService,
   private router: Router
  ){}
  logout(): void{
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  
}
