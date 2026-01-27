import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.currentUserValue) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

export const roleGuard = (allowedRoles: string[]) => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    console.log(authService);

    const currentUser = authService.currentUserValue;
    if (currentUser && allowedRoles.includes(currentUser.role)) {
      return true;
    }

    router.navigate(['/unauthorized']);
    return false;
  };
};
