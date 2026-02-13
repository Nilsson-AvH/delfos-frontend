import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HttpAuth } from '../services/http-auth';
import { tap } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  // Paso 1 : Inyectar la dependencia de HttpAuthService para verificar el estado de autenticación

  const httpAuth = inject(HttpAuth);
  const router = inject(Router);

  // Paso 2 : Verificar invocar el metodo ckeckAuthStatus() de HttpAuthService retornara el acceso a la ruta protegida (true) o no (false)

  return httpAuth.checkAuthStatus().pipe(
    tap((isAuthenticated) => {
      if (!isAuthenticated) {
        router.navigateByUrl('/login'); // Bloquea el acceso a la ruta protegida
      }
      return true; // Permite el acceso a la ruta protegida
    })
  );
};
