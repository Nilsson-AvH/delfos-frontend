import { CanActivateFn, Router } from '@angular/router';
import { HttpAuth } from '../services/http-auth';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export const roleGuard: CanActivateFn = async (route, state) => {

  const httpAuth = inject(HttpAuth);
  const router = inject(Router);

  // Extrae la lista de roles permitidos desde la data de la ruta.
  const allowedRoles = route.data['roles'];

  //Obtenemos los datos del usuario actual (en un observable) y los convertimos a una promesa para poder usarlos con await.
  const user = await firstValueFrom(httpAuth.currentUser$);

  //Obtenemos el rol del usuario actual.
  const role = user?.role;

  console.debug('🟢 Rol del usuario:', role);
  console.debug('🟢 Roles permitidos:', allowedRoles);

  // Paso 1: Verificamos si NO hay usuario o no (Aunque el authGuard ya lo hace) (Opcional para los bobitos).
  if (!user) {
    //TODO: Ventana emergente.
    router.navigateByUrl('/login');
    return false;
  }

  // Paso 2: Verificamos si la ruta no tiene definidos los roles, si no los tiene, se permite el acceso.
  if (!allowedRoles || allowedRoles.length == 0) {
    return true;
  }

  // Paso 3: Verificamos si el usuario tiene el rol necesario en la lista de roles permitidos (data.roles).
  if (role && allowedRoles.includes(role)) {
    return true;
  }

  // Por defecto: Si no tiene permiso, se redirige al dashboard.
  router.navigateByUrl('/dashboard');
  return false;
};
