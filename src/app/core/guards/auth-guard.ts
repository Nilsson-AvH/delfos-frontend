import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  // Paso 1 : Inyectar la dependencia de HttpAuthService para verificar el estado de autenticación

  // Paso 2 : Verificar invocar el metodo ckeckAuthStatus() de HttpAuthService retornara el acceso a la ruta protegida (true) o no (false)

  return false;
};
