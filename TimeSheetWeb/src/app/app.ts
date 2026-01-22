import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterOutlet, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class App implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = signal(this.authService.currentUserValue);

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser.set(user);
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
